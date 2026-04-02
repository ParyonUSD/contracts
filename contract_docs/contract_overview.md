# Contract Overview

## Table of Contents
+ [High Level Design](#high-level-design)
  + [Borrowing contract](#borrowing-contract)
  + [Price contract](#price-contract)
  + [Loan contracts](#loan-contracts)
  + [Stability Pool](#stability-pool)
  + [Redeemer](#redeemer)
  + [LoanKey Factory](#loankey-factory)
+ [Single Function Contracts](#single-function-contracts)
+ [Helper Contracts](#helper-contracts)
  + [Modular contract functions](#modular-contract-functions)
  + [Contract functions identifiers](#contract-functions-identifiers)
  + [Sidecar outputs holding tokens](#sidecar-outputs-holding-tokens)
  + [independent child contracts](#independent-child-contracts)
+ [The Stability Pool](#the-stability-pool)
  + [Periods vs Epochs](#periods-vs-epochs)
  + [The Staking and Unstaking Mechanism](#the-staking-and-unstaking-mechanism)
  + [The Interest Collection Mechanism](#the-interest-collection-mechanism)
  + [The Interest Payout Mechanism](#the-interest-payout-mechanism)
  + [The Liquidation Mechanism](#the-liquidation-mechanism)
+ [The Redemption Mechanism](#the-redemption-mechanism)
  + [Redeemable Loans](#redeemable-loans)
  + [Finding the Lowest Interest Rate Loan](#finding-the-lowest-interest-rate-loan)
  + [Multiple and Partial Redemptions](#multiple-and-partial-redemptions)
  + [Starting a Redemption](#starting-a-redemption)
  + [Swapping the Target Loan](#swapping-the-target-loan)
  + [Finalizing a Redemption](#finalizing-a-redemption)
  + [Free Option Problem](#free-option-problem)
  + [Solution for the Free Option Problem](#solution-for-the-free-option-problem)
+ [The PriceContract Mechanism](#the-pricecontract-mechanism)
  + [PriceContract Migration](#pricecontract-migration)
+ [Timekeeping](#timekeeping)
+ [The Interest Management Mechanism](#the-interest-management-mechanism)
+ [The Use of Unique LoanTokenIds](#the-use-of-unique-loantokenids)
+ [Minimum Loan, Stake \& Redemption Sizes](#minimum-loan-stake--redemption-sizes)
+ [Contract Setup Parameters](#contract-setup-parameters)
+ [Parallelism](#parallelism)
+ [Transaction Fees](#transaction-fees)
+ [Trust In Transaction Building](#trust-in-transaction-building)

## High Level Design

At a high level the ParityUSD contract system consists of 6 parts:

1) The Borrowing contract (which holds the ParityUSD reserves)
2) The Loan contracts
3) The Price contract
4) The Stability Pool (aka the liquidator or staking pool)
5) The Redeemer
6) The LoanKey Factory

When looking at the `parity_contracts` repo you can see the same structure. `Parity.cash` refers to the top-level borrowing contract and the `loanKey` folder refers to the 'LoanKey Factory' functionality.

```
contracts/
  ├── loan/
  ├── loanKey/
  ├── redeemer/
  ├── stabilitypool/
  ├── Parity.cash
  └── PriceContract.cash
```

When setting up the ParityUSD smart contract system, 5 tokenIds need to be provided in `ParityDeployment`.
This is because the borrowing contracts, the loans and the price contracts all share the `parityTokenId`.

```ts
  tokenIds: {
    parityTokenId: '9b560c75a691222c839a80048a33e93f80111af1b8492dfe90c839d6078dc0ea',
    poolTokenId: '6991062b640e347304a72a0f66506b487d428a98a132af7624e8c1c8d1291695',
    redeemerTokenId: '95378105459f384acb33635ff834d51d90f236916b48326f73626841d581a18d',
    loanKeyFactoryTokenId: '5008018b4c0b84eded6ff076b771a59de426ab207205a2f77daa8d2793d929bd',
    oracleMigrationKeyTokenId: '82d850b448ce07ce8d15ab954042ba4f4ed6d94142bb459eed52c25c8024e32a'
  },
```

Let's discuss each of the 6 parts of the Parity system:

### Borrowing contract

1st the Parity borrowing contract, this contract holds the ParityUSD is responsible for creating loans with a correct initial state which meet the minimum collateral requirements. Technically this means that the borrowing contract holds a minting NFT. The creation of a loan is of course dependent on the current market price but that is the role of the Price contracts. This contract holds the full ParityUSD stablecoin supply initially. Note that there can be multiple instances of this contract to allow for parallelism.

### Price contract

2nd is the Parity priceContracts, this contract is responsible for updating its own state with the latest price info and sharing this latest price info with other contracts in the parity system. For this function to update its own state, the contract needs a mutable NFT. Note here also that there can be multiple instances of this contract to allow for parallelism.

### Loan contracts

3rd is the loan contracts itself. As discussed before this is a 'dumb top-level contract' where all contract logic is offloaded to the loanfunctions. The loan also always had a tokensidecar attached which keeps track of the loanOwner-tokenid (aka loanKey). The loan holds multiple pieces of state in the NFT commitment, because this state can be updated by the loanFunctions, loans keep a mutable NFT to store this state.

### Stability Pool

4th is the stability pool, which holds the staked ParityUSD used for liquidations. To keep track of the stakers, the stability pool issues receipts. These receipts can be used to withdraw again from the pool.

The StabilityPool, as the name implies, guards the system stability by liquidating bad loans. The stabilityPool also collects interest from the loans, this is done through the Collector contract.

For these earnings, the pool regularly creates payout contracts where stakers can claim their part of the stability pool earnings. Technically, this means that the stability pool holds a minting NFT to create these receipts and payout contracts. The stabilityPool needs a tokenSidecar to carry ParityUSD tokens besides its own minting NFT.

2/7 loanFunctions are for the interacting with the stabilitypool: `liquidate` & `payInterest`.

### Redeemer
5th is the redeemer contract, which processes redemptions against target loans. To create individual redemptions, the Redeemer needs its own Minting NFT. Redemption contracts are relatively complex as there are three parts to them:

1. The target loan, this part can be changed so is kept in a mutable NFT. 
2. The ParityUSD to redeem against BCH, this is kept in a dedicated tokensidecar.
3. The immutable state with the redemption payout-address. 

Because of this, an individual redemption exist out of 3 outputs.

### LoanKey Factory
6th is the loanKey factory contract, this setup got added to the system to enable nice interoperability with the existing BCMR token metadata standard. The loanKey factory allows loanKeys to be precreated so their metadata can already be assigned prior to the borrowing transaction, further this allows for control over the authChain for metadata updates.

## Single Function Contracts

In the ParityUSD design most contracts only have a single contract function, with the exceptions of `Parity.cash`, `PriceContract.cash`, `Redemption.cash` and `Collector.cash`. So instead of 1 big loan contract with 8 functions, each of the loan functions is a separate single-function helper contract. The ParityUSD contract system works by composing single function contract who authenticate/require each other's presence in a transaction to enforce the full contract system's logic.

This is large part of the reason why ParityUSD has 26 contracts in total whereas the number of sub-systems are only the 6 outlined above. This is because there are a bunch of helper-contracts in the system which we'll go over in the next section.

## Helper Contracts

The loan contract itself is dummy contract which needs to be attached to 1 of 8 `loanContractFunctions`. Similarly the stability pool relies on 1 of 4 `pool-functionContracts`. The loan contract also has 1 helper contract to keep the tokenId state, the Redeemer has 2 helper contracts, the stability pool has 3 helper contracts and finally the loanKey factory has 2 helper child contracts.

6 main contracts + (8 + 4 + 1 + 2 + 3 + 2) helper contract = 26 total

There are 3 types of helper contracts:

1) modular contract functions,
2) sidecar outputs holding tokens,
3) independent child contracts.

To group our 20 helper contracts into these three categories we get:

1) modular contract functions: 8 `loanContractFunctions`, 4 `pool-functionContracts`
2) sidecar outputs holding tokens: `LoanTokenSidecar`, `redemption-tokenSidecar` & `tokenSidecarPool`
3) independent child contracts: `Redemption`, `Payout`, `Collector`, `loanKeyOriginEnforcer` & `loanKeyOriginProof`

For each category of helper contract there is a distinct rationale.

### Modular contract functions

First, modular contract functions exist to attach logic to a "dumb" top-level contract.

This means `loan.cash` and `stabilitypool.cash` are these dumb top-level contract which are outsourcing their logic.

The advantage of this is that you can break up the smart contract logic across files (with manageable overhead) and you save on transaction size and fees by not including the unused contract logic in your transaction.

Breaking up the contracts in small sizes was also simply required to be valid for the VM limits pre-May 2025.

### Contract functions identifiers

Each of the "Modular contract functions" has a unique identifier. Below we'll list the single-byte loan Function contract identifiers:

```ts
export enum LoanFunction {
  LIQUIDATED = "01",
  MANAGE_LOAN = "02",
  REDEEMED = "03",
  START_REDEMPTION = "04",
  SWAP_IN_REDEMPTION = "05",
  SWAP_OUT_REDEMPTION = "06",
  PAY_INTEREST = "07",
  CHANGE_INTEREST = "08",
}
```

and here are the single-byte pool Function contract identifiers:

```ts
export enum PoolFunction {
  ADD_LIQUIDITY = "01",
  LIQUIDATE_LOAN = "02",
  NEW_PERIOD = "03",
  WITHDRAW_LIQUIDITY = "04",
}
```

### Sidecar outputs holding tokens
Secondly, each UTXO on BCH must hold some Bitcoin Cash (at least the dust amount) and can optionally hold 1 tokencategory.
For this single tokencategory the contract can hold fungible tokens, nft's or both.
So for contracts which already have a TokenId by which to hold another token, they simply need a secondary UTXO attached, with a simple contract code so it is always required to be attached as a sidecar output.

### Independent child contracts
Third, independent child contracts, these are the contracts which are created by other contracts to perform a specific sub function.
Unlike the 'modular contract functions' which only perform a function when attached to a top-level contract, these child contracts make transactions fully independently after their creation.
At creation these helpers are initialized with specific information (state) which instructs their specific task.
For example a `collector` needs to be authorized to collect from certain loans, the `Payout` needs to payout some total across some number of participants and the `Redemption` needs information about the price, amount and destination.

The `loanKeyOriginEnforcer` in an independent child contract created by the loanKey factory contract. The `loanKeyOriginEnforcer` holds the newly prepared loanKey and the `loanKeyOriginProof` is a sidecar output which holds the token-proof that the prepared loanKey was indeed created by the factory contract.

## The Stability Pool 

The Stability Pool holds staked ParityUSD which is put to work to earn yield for stakers from interest payments and liquidation profits.

### Periods vs Epochs

The stability pool operates on a dual timeframe system:

- **Period**: 144 blocks (~1 day) - Used for interest collection from loans
- **Epoch**: 10 periods (~10 days) - Used for staking rewards distribution

Epoch 0 contains periods 0-9, Epoch 1 contains period 10-19, etc.

### The Staking and Unstaking Mechanism

Stakers can add liquidity to the stability pool by staking ParityUSD and earn interest from the loans. When they do so they receive a receipt which is post-dated to the start of the next epoch. Stakers can also remove liquidity from the stability pool by withdrawing their ParityUSD. When they do so they must return the receipt.

Staking operates on epoch boundaries. Staked funds accrue interest only for complete epochs that start after their creation. When users stake ParityUSD, they receive a receipt for the next epoch. For example, if a staker stakes ParityUSD during period 15 (epoch 1), they receive a receipt for epoch 2 and will start earning interest from epoch 2 onwards. 

The `AddLiquidity` contract calculates the next epoch as value for the `epochReceipt` state. This is because withdrawals can only occur within the same epoch as the receipt, withdrawal is locked until the start of the next epoch. The logic is enforced by the following code:

```solidity
  // Calculate next epoch for receipt because withdrawals are only allowed from the next epoch
  // Divide by 10 because there's 10 periods per epoch
  int currentEpoch = int(periodPoolBytes) / 10;
  int nextEpoch = currentEpoch + 1;
```

The `WithdrawFromPool` contract which handles the unstaking only allows for full withdrawals of the amount staked on user staking receipts. The Withdrawal function still compensates stakers with BCH interest earnings already earned in the current epoch.

If any liquidations happened during the current epoch, then pro-rata reduction of stake and payout of BCH liquidation earnings also take place at withdrawal time. Practically, this means that the amount which can be unstaked (withdrawn) from the pool is dependent on the share of pool funds spent in liquidations. A staking receipt of 1000 PUSD in the latest epoch can only withdraw 750 PUSD if the stability pool spent 25% of the staked funds in liquidations this epoch. The withdrawer also gets the corresponding BCH liquidation earnings paid out at withdrawal time.

### The Interest Collection Mechanism

Interest is collected from loans on a daily basis (each period) through the following process:

1. **Daily Collection**: Each loan pays interest every period via the `payInterest` function to the active `Collector` contract
2. **Accumulation**: The `Collector` contract accumulates interest payments in BCH throughout the epoch (10 periods)
3. **Protocol Fees**: When the `Collector` is destroyed at epoch boundaries, 70% goes to stakers and 30% becomes protocol fees

This daily collection ensures responsive interest rate adjustments while accumulating rewards for efficient distribution at epoch boundaries.

### The Interest Payout Mechanism

Staker rewards are distributed at epoch boundaries (every 10th period) through the following process:

1. **Payout Contract Creation**: When `newPeriod % 10 == 0`, the `NewPeriodPool` function creates a `Payout` contract and UTXO containing accumulated BCH from:
   - Interest in BCH collected from loans, taken from the destroyed `Collector` contract (70% after protocol fees)
   - BCH earned from liquidating undercollateralized loans, via the `StabilityPool` UTXO

2. **Claiming Process**: Stakers use their staking receipts to claim rewards from the `Payout` contract, which updates their receipt for the next epoch and calculates their proportional rewards. For example a staking receipt with period 20 can be used to claim rewards from the Payout contract created for epoch 2. The receipt will be updated to period 30 and can then be used to claim rewards from the Payout contract created for epoch 3. This process can be repeated until the receipt is updated to the current period for which no `Payout` contract exists yet.

3. **Reward Calculation**: Each staker's share is calculated in their claim transaction and is proportional to their staking amount relative to the total staked during that epoch. The Payout contract stores both `totalStakedEpoch` and `remainingStakedEpoch` to handle liquidations correctly. In the case of no liquidations the new user receipt has the same `amountStakedReceipt` token amount, in case of liquidations the receipt's new `amountStakedReceipt` token amount will be lower proportional to the `remainingStakedEpoch` after processing the liquidations.

### The Liquidation Mechanism

The `StabilityPool` contract holds a minting NFT with state about the pool, and it keeps the ParityUSD of stakers in the `StabilityPoolSidecar`. When the stabilityPool liquidates a loan (repays the ParityUSD loan debt and claims the BCH collateral), the earned BCH is stored on the `StabilityPool` UTXO until it is paid out to stakers through the `Payout` contract at epoch boundaries.

The BCH yield paid to the stakers comes from the interest paid by loans to the `Collector` and from the BCH earned through liquidating loans. Only tokens that have been staked for a full epoch can be used in liquidations (part of `totalStakedEpoch`).

The stability pool can interact with loan contracts with the `LiquidateLoan` stability pool function which corresponds to the `liquidate` function on a loan. The other function contracts of the stability pool are `AddLiquidity`, `WithdrawFromPool` & `NewPeriodPool`.
The `NewPeriodPool` function creates 2 independent child contracts which are essential for the interest collection & payments namely the `Collector` and `Payout` contracts.
On `NewPeriodPool`, the previously created `Collector` is also destroyed by sending its collected funds to the stability pool.

## The Redemption Mechanism

The redemption mechanism is crucial to the stability of ParityUSD and provides the primary incentive for borrowers to pay interest. It allows users to swap ParityUSD for the equivalent value of underlying collateral (Bitcoin Cash) at any time. Unlike liquidations, redemptions do not involve the stability pool.

### Redeemable Loans

A core rule of the system is that loans must be redeemed in order of their interest rates. The loan with the lowest interest rate must be redeemed first. This incentivizes borrowers to pay higher interest rates to avoid redemption and we must therefore ensure that each redemption targets the correct loan. The only exception to this is small loans with less than 100 PUSD debt which can be redeemed regardless of interest rate.

At any time the redeemable loans are therefore:
  - The loan with the lowest interest rate
  - Any loans with less than 100 PUSD debt

### Finding the Lowest Interest Rate Loan

In the UTXO model there is no global view of the list of all loans and their respective interest rates. Instead, we work with an optimistic design where users target a loan for their redemption, and if this is NOT the lowest interest paying loan than this can be proven and the redemption target will be swapped. This means redemptions will need to take time before finalizing to allow for these target loan swaps to occur.

If the loans in the set are fixed then the described mechanism works well, however new loans can be created and interest rates can be updated. So there needs to be special handling to make sure we are indeed attempting to find the lowest interest rate from a fixed set of loans.

To solve for newly created loans being the new lowest interest rate loan after a redemption already started, loans have a `Status` which we describe in [Swapping the Target Loan](#swapping-the-target-loan). To solve for interest rates changing when a new period starts we lock down the period considered for the swap redemption mechanism, which we describe in [Solution for the Free Option Problem](#solution-for-the-free-option-problem).

### Multiple and Partial Redemptions

A user may wish to redeem an amount which doesn't match the outstanding debt of a redeemable loan. If the desired amount is large then multiple transactions are needed to redeem multiple loans. If the amount, or the remainder after multiple redemptions, is small then a partial redemption occurs. 

For example, if a user wants to redeem 250 PUSD and the loans in order of interest rate are:

- Loan 1: 100 PUSD debt, interest rate 1%
- Loan 2: 100 PUSD debt, interest rate 2%
- Loan 3: 100 PUSD debt, interest rate 3%

Loans 1 and 2 will be fully redeemed and loan 3 be partially redeemed leaving remaining debt of 50 after the redemption.

A partial redemption reduces the collateral and outstanding debt of the loan but leaves it otherwise active. If the outstanding debt is reduced to less than 100 PUSD then the loan becomes redeemable regardless of interest rate. This helps clean up small loans and ensure that loans meet the minimum loan size.

### Starting a Redemption

A redemption is created by interacting with the Redeemer contract. A redemption consists of 3 UTXOs, the redemption UTXO itself and two sidecar utxos. The first sidecar UTXO is the stateSideCar which holds state in an immutable NFT, and the second sidecar is the tokenSidecar which holds the ParityUSD tokens to use for the redemption. 

The price used for the conversion of PUSD to BCH is locked in during the start of the redemption and is 0.5% below the oracle price. The `redemptionPrice` together with the `redeemerPkh` gets stored in the immutable state of the stateSidecar. The `targetLoanTokenId` and `redemptionAmount` are stored in mutable state of the redemption UTXO.

When a loan has a pending `amountBeingRedeemed`, the loan owner cannot fully repay his loan with `manageLoan`. The redemption takes priority but the loan owner is still able to pay his oustanding debt minus the pending redemption amount.

### Swapping the Target Loan

If a redemption targets a loan which is not redeemable, the system allows the loan holder (or any other participant) to swap it for a loan with a lower interest rate during a time window between the redemption being created and finalized. The loan with the lower rate is said to be *swapped in* and the loan with the higher interest rate is said to be *swapped out*. 

To prevent gaming of this mechanism, we must prevent the loan holder  from creating a new loan with a lower interest rate specifically for this purpose. To do so we track loan age via a `status` byte in the loan's mutable NFT commitment with three possible values:

- `0x00`: New loan (freshly created, has never paid interest, ineligible for swap in)
- `0x01`: Single-period loan (has paid interest once, ineligible for swap in)
- `0x02`: Mature loan (has paid interest multiple times, eligible for swap in)

We then require that only a mature loan (`0x02`) can be swapped in as the new target loan. Although non-mature (`0x00` or `0x01`) loans can't be swapped in, they can be the initial target loan of a new redemption and so are not immune from redemption.

The rules are enforced by the `swapOutRedemption` and `swapInRedemption` loan functions. Along with `startRedemption` and `redeem` the redemption rules constitute 4 of the 7 loan functions and therefore represent significant complexity within the contract system.

The swapped in loan may not match the swapped out loan in value. If it is smaller the redemption will be partially fulfilled and the remainder will be refunded to the redeemer. If it is larger the redemption will be completely fulfilled and the loan with be partially redeemed. The original redemption amount is kept in the redemption token sidecar but the actual amount pending redemption after a target loan swap is stored in the mutable state (NFT commitment) of the redemption UTXO.

Swapping of target loans should occur rarely and only when redemptions don't follow the intended process. The reasons for this could be malicious or accidental. We prioritize the protection of large loans against malicious actors over the correction of errors in loan selection.

Partially redeemed loans remain eligible for swapping in. This ensures full redemption before moving to the next lowest-rate loan.

### Finalizing a Redemption

The time window during which a target loan can be swapped is configured by the global parameter `timeLockRedemption`, currently set to 12 blocks (approximately 2 hours). Once this window has passed, the redemption can be finalized. It is implemented by setting the sequence number (relative locktime) of the redemption input to the `timeLockRedemption` value.

### Free Option Problem

Because the price for redemptions locks in at the start but redemptions can be (partially) cancelled by 'swapRedemption', there is a free-option problem.

When a redeemer starts a redemption strategically when a new period is about to start, the redeemer can cancel his own redemption with 'swapRedemption' by making his own loan the new lowest interest rate loan. This way the redeemer can choose whether to exercise his redemption at the locked in price, or to cancel his redemption. The redeemer in effect receives a 'free BCH price option' from the contract system.

One possible solution is to only lock-in the redemption price at the end of the redemption process, however we choose to not sacrifice this desired aspect of the protocol. Instead, there is a need for special handling so 'swapRedemption' cannot be abused across period boundaries.

### Solution for the Free Option Problem

To solve for the free-option problem, we introduce two new rules to the redemption mechanism:

1. Redemptions can only be swapped to loans from the same period (as indicated by `lastPeriodInterestPaid`)
2. Redemption started during this turnover window when a new period starts, can be cancelled (to protect loans to be redeemed against when they cannot fully rely on the redemption swapping mechanism)

This way the redeemer does not anymore have the option to let his redemption complete at the current price or to cancel. This solution however introduces some downtime in the availability of the redemption mechanism as redemptions take 14 blocks (~2 hours) and a window where all pending redemptions can be cancelled.

```solidity
      // Check if current blockheight is in the period turnover window
      // We restrict locktime to below 500 million as values above are unix timestamps instead of block heights
      int newPeriod = currentPeriod + 1;
      int blockHeightNewPeriod = startBlockHeight + newPeriod * periodLengthBlocks;
      // Any redemption still running when new period start can be cancelled
      bool isInNewPeriod = tx.locktime >= blockHeightNewPeriod && tx.locktime < 500_000_000;

      // If a new period has started, allow to cancel the redemption
      if(isInNewPeriod){
        redemptionAmountToFinalize = 0;
      } else 
```

## The PriceContract Mechanism

The PriceContract is coded to validate BCH/USD oracle priceMessages from the oracle run by General Protocols. Instead of using every 1-minute pricemessage, the contract is coded to update its price state every 10 minutes (so every 10th message produced by the oracle). In addition to this general heartbeat, when the price changes more than 0.5% within this 10-minute interval, an additional price update is accepted to correct the contract's price state.

### PriceContract Migration

The PriceContract has a function `migrateContract` which enables a migration key to change the contract bytecode of the PriceContract. This means that whereas the other contracts are immutable, the PriceContract can be upgraded or changed over time.
Specifically this is intended for should problems with the hardcoded oracle occur or should something have to change about the update frequency.

Note that the `oracleMigrationKey` can also change the layout of the nftCommitment upon migration, specifically the price contract state can be extended:

```solidity
/*  --- State Mutable NFT ---
    byte identifier == 0x00
    bytes4 sequence,
    bytes4 pricedata
    (can be extended in the future with extra fields by migrating the pricecontracts)
*/
```

## Timekeeping

Loans, redemptions, the stability pool, price contracts and parity borrowing contracts all have their own individual state stored in their respective NFT commitments. However there is one item of state which applies to the whole system and this is the time, which is tracked as the `period`.

The `period` of the Parity system is a derived value from the current blockheight. The `period` is calculated through `startBlockHeight` and `periodLengthBlocks`. The current block height cannot be read directly so we use `locktime` to track this state which needs to be done with careful consideration.

The `period` state is both kept in the Parity borrowing contract for new loans and in the stabilityPool for collecting interest and paying out staking rewards.

The design requires that the stabilityPool `period` must be updated in a timely manner to reflect the blockheight but the parity borrowing contracts could be allowed to trail in the past. Borrowers are incentivized to update the `period` when they create a loan as they do not want to be charged for extra interest periods.

The length of each `period` is a globally configurable parameter, currently set to 144 blocks or approximately one day.

Reducing the period length would increase the amount of transactions needed because:
- every loan needs to pay interest each period (1 tx/loan)
- the stabilitypool `newPeriodPool` method has to be updated each period (1tx)
- the borrowing contracts `updatePeriodState` method has to be updated each period (1tx * #borrowing-contracts)
- every 10th `newPeriodPool` there is a payout contract created where each staker will have to claim their payout

The number of transactions per period and epoch are calculated as follows:

>  Transactions per period = 1 + #loans + #borrowing-contracts

>  Transactions per epoch (10 periods) = 1 + #stakers

The following considerations must also be taken into account when setting the period length:
- new staked funds only begin to earn at the start of the next period
- the `period` is stored as `bytes4` type and appears 3 times in the loan-state

A `period` length of roughly one day prioritizes the interest rate adaptibility by making interest rates update daily.

This high frequency of `payInterest` transactions does not impact the stakers to the same degree because only every 10th period is made into a payout transaction.

## The Interest Management Mechanism

Loans have 10 state items, 6 of which have to do with the loan's interest rate.

```solidity
/*  --- State Mutable NFT (10 items, 27 bytes) ---
    byte identifier == 0x01
    bytes6 borrowedTokenAmount (tokens)
    bytes6 amountBeingRedeemed (tokens)
    byte status (0x00 newLoan, 0x01 single period, 0x02 mature loan)
    bytes4 lastPeriodInterestPaid
    byte2 currentInterestRate
    byte2 nextInterestRate
    byte interestManager
    bytes2 minRateManager
    bytes2 maxRateManager
*/
```

First note that the loan has a `currentInterestRate` which is the interest rate fixed for this `period`, and a `nextInterestRate` which is an updatable field for the next contract period. Each loan also tracks `lastPeriodInterestPaid`, in all normal circumstances this should simply be the current system period.

Each loan can also appoint an interest manager which would be a 3rd party holding an immutable nft with the `loanTokenId` and a commitment matching the `interestManager` field. The interest manager can be restricted in their possible actions by setting a `minRateManager` and `maxRateManager`. When the loanManager is set to `0x00` in the loan state, this means there is no interest manager appointed for the loan.

## The Use of Unique LoanTokenIds

In our contract system each loan has a unique `LoanTokenId` which is kept in the LoanSideCar. The minting NFT with the `LoanTokenId` is the LoanKey which can manage the loan and access its collateral. 

One benefit of using a unique `LoanTokenId` as loan identifier is that it becomes possible to query the full loan history with ChainGraph with this `LoanTokenId`. By using a minting NFT as LoanKey it's also easy to enable users to create a backup LoanKey to keep in cold storage for example. Using TokenIds as unique identifier also has the benefit of not having to introduce a "serialNumber" system for both loanOwners and interestManagers.

## Minimum Loan, Stake & Redemption Sizes

The ParityUSD contract system strictly enforces minimum sizes for loans, staking and redemptions, all set to a minimum size of 100.00 PUSD.

A minimum on loan size is required so the redemption mechanism cannot be griefed and so there cannot be huge amount of small "spam" loans created as a DOS attempt to cause UTXO congestion for normal users or in attempt to complicate keeping overview for interest payments or liquidations. The minimum loan size of course is also enforced during `manageLoan` where part of the loan debt is repaid, additionally the size of the remaining loan debt after repayment should also be at least 100 PUSD.

The only scenario where the debt of a loan can go below the minimum of 100 PUSD is when the loan has a redemption complete which redeems just short of the full loan debt. Loans below 100 PUSD can be redeemed regardless of their interest-rate because they are not eligible for the "swap redemption" mechanism.

For similar reasons to the loans, the minimum size for staking and redemptions is also set at 100 PUSD to protect against attempted malicious behavior. Also the minimum withdrawal size for the StabilityPool is set to 100 PUSD and the remaining amount staked should be at least 100 PUSD.

## Contract Setup Parameters

When setting up the ParityUSD contract system a few parameters need to be decided, these are also need to be provided in the `ParityDeployment` configuration.

```ts
  contractParams: {
    oraclePublicKey: "02d09db08af1ff4e8453919cc866a4be427d7bfe18f2c05e5444c196fcf6fd2818",
    protocolFeeLockingBytecode: "76a9149260c97136d4348ae68653a4a8baebc5d632da9e88ac",
    startBlockHeight: 270000n,
    periodLengthBlocks: 144,
    timeLockRedemption: 12n
  }
```

Further, there are some parameters which need to be decided upon setup but are not part of the `ParityDeployment` configuration.

The number of UTXOs created during contract setup is important for enabling parallelism, as we'll discuss in the next section.

## Parallelism

Bitcoin Cash transactions can be validated in parallel because of local state, however each unconfirmed transaction chain still happens in sequence. This can become problematic when the same UTXO is being spent roughly simultaneously by different users. For ParityUSD to handle a very large number of users, we need to think about the problem of UTXO congestion, to avoid so called 'race-conditions'.

The specific number of UTXOs for each of these is decided during the parity-setup, so cannot be changed anymore after the initial contract deployment. There is no dynamic thread-spawning in the contract design.

The parts of the system which can have multiple UTXOs for each contract are the following:
- The Borrowing Contract
- The Price contract
- The 8 Loan Function contracts
- The Redeemer contract
- The LoanKey Factory


We have tested and plan to launch with the following setup:

```ts
const config = {
  numberDuplicateParityUtxos: 10, // stateful
  numberDuplicatePriceContractUtxos: 5, // stateful
  numberDuplicateLoanFunctionUtxos: 25, // stateless
  numberDuplicateRedeemerContractUtxos: 25, // stateless
  numberDuplicateLoanKeyFactoryUtxos: 5 // stateless
}
```

Note which of these contracts is state-less versus state-full. For stateful contracts, it may become more difficult to keep state synchronized across UTXOs when having many contract UTXOs. 

However there are also parts where there is only a single contract UTXO
- a single StabilityPool UTXO
- a single collector contract for each period
- a single payout contract for each epoch

These UTXOs present potential bottlenecks which could cause UTXO congestion, so it needs to be carefully considered what amount of interactions are expected with these UTXOs.

## Transaction Fees

For user-initiated transactions the contract design is to have the users pay for their own fees.
For transactions related to the operation of the system, the contract design is to let the contracts pay for their own fees whenever possible.

Examples of this are 
- `newPeriodPool` and `liquidatedLoan` for the stabilityPool
- `swapRedemption` and `finalizeRedemption` for the redemptions
- `payInterest` for loans

These transaction fees are then hard-coded values based on the transaction size like `1500` or `2500` sats. Additional fees can always be added by adding a BCH input and corresponding change output. It is not possible to make the fees dynamic from inside the contract, as the contract cannot know the state of the mempool or fee market and thus cannot adjust fee rates by itself.

The transactions where the operator always has to pay the fees is the `updatePrice` of the Price contract and `updatePeriodState` of the Parity Borrowing contract, as these contracts don't hold any BCH to spend.

## Trust In Transaction Building

The Parity contracts do not lock down the users inputs and outputs, this is to allow for flexibility with regards to UTXO selecton, HD wallet and to enable modular contract interactions.

However currently using BCH WalletConnect the transaction building is happening on the Dapp-side, meaning that the dapp is responsible/trusted for filling in the correct user-address for flexible destinations. A malicious dapp could misdirect the users PUSD, loankey or BCH outputs to an address different from the user address.

However, with advances in transaction building technology like Libauth Templates, CashConnect and XO Contract contract templates, this trusted element will be able to be resolved in the future by relying on a list of templates so the wallet can perform the transaction building, instead of relying on the Dapp for this.
