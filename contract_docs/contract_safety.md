# Contract Safety

This is a list of items that should be checked to ensure contract safety.

## Self-Replicating Covenants
With long running covenants it's crucially important that the self-replicating logic is correctly implemented.
There's four categories of covenants:

1) Exactly self-replicating covenants
2) State-mutating covenants
3) State-and-balance-mutating covenants
4) Conditionally-replicating covenants

Let's discuss each in more detail!

### Exactly-self-replicating covenants
Exactly-self-replicating covenants are UTXOs which enforce they are recreated exactly the same. These UTXOs will always stay available from the moment of their creation.

- Redeemer
- loanKey factory
- nft functions

### State-mutating covenants
State-mutating covenants are UTXOs which enforce they are almost exactly recreated except for state in their nft commitment. These UTXOs will also always stay available from the moment of their creation, but the nftCommitment kept in the mutable/minting NFT will mutate over time.

- Parity Borrow contract
- Price contracts

### State-and-balance-mutating covenants
State-and-balance-mutating covenants are UTXOs which enforce they are recreated but both the state and bch-balance are allowed to change. These UTXOs will also always stay available from the moment of their creation.

- Stability Pool

### Conditionally-replicating covenants
Conditionally-replicating covenants are UTXOs which only conditionally enforce they are recreated. These UTXOs won't stay available indefinitely.

- Parity Loans
- independent child contracts
  - redemptions
  - collector contract
  - payout contract

Sidecar covenants follow the type of corresponding top level contract.
But because they don't hold any state they will be either 'Always-self-replicating' or 'Conditionally-replicating'

The stability pool sidecar is 'Always-self-replicating', loan sidecars are 'Conditionally-replicating'

## Checks for Self-replicating Covenants

example from `Parity.cash`

Notice the 5 checks `lockingBytecode`, `tokenCategory`, `value`, `tokenAmount` & `nftCommitment`
where `tokenCategory` also checks the NFT capability

```solidity
      // Recreate contract at outputIndex0 exactly
      require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate contract at output0 - invalid lockingBytecode");
      require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");
      require(tx.outputs[0].value == 1000, "Recreate contract at output0 - needs to hold exactly 1000 sats");
      require(tx.outputs[0].nftCommitment == periodParityBytes);

      // Calculate amount borrowed, enforce minimum debt
      int borrowedAmount = tx.inputs[0].tokenAmount - tx.outputs[0].tokenAmount;
      require(borrowedAmount >= 100_00, "Invalid borrowedAmount, needs to be at least minimumDebt");
```

When dealing with tokencategories which do not have fungible tokens like the StabilityPool, the redeemer or the priceContract, this `tokenAmount` check can be safely left out because there are no fungible tokens with that tokenCategory.

## Verifying Authority

Four tokens have special authority with regards to Parity Loans namely
- loankey/managerKey
- the stability pool
- the redeemer
- the price contracts

This authority needs to be carefully validated, especially when the same tokenId can represent different authorities like in the case of the loankey/managerKey.

## Protecting Mint-Authority

With contracts holding minting NFTs, all outputs need to be carefully controlled in the covenant contract code, so no additional (minting) NFTs can un-intentionally be created in other outputs.

There's 4 Mint-Authorities in ParityUSD
- Parity Borrow contract
- Redeemer
- loanKey Factory
- Stability Pool (together with the created Payout contract!)

## Keeping Track of Time

Keeping track of time in a covenant is difficult because there is not global information available on blockheight.

Instead there needs to be a mechanism where the old time is kept in state and this can be updated with a newer time that passes a check_locktimeverify checks. This guarantees because of the transaction level locktime that this time is in the past.

In Parity there is two places where we track time (the system period, where each period is roughly one day)
- the stability pool
- Parity Borrow contract

For the stability pool, the stakers and the parity server has reason to update this period state. There is also just one UTXO so it's easy to update this by making a transaction.
For the Parity Borrow contract, there can be multiple UTXOs and they could even be behind in the state they are tracking. This is not a problem however as users have an incentive to update the state to the latest possible period upon interaction. Only the user loses when he borrows at an old period because he will have to make additional interest payments.

## Standardness rules

- Covenants can't commit to payout to arbitrary lockscripts (those can be non-standard)
- Covenants can't commit to payouts below the dust limit (they're non standard)

### Arbitrary lockscripts

The redemption mechanism needs to make sure it does not commit to non-standard lockscripts as this would prevent the redemption from being finalized. Therefore redemptions can only commit to a 20-byte pkh commitment when creating a redemption, from that it constructs the P2PKH locking bytecode for the redemption payout.

### Dust limit

The `Payout` contract where stakers can claim their BCH staking rewards needs careful logic to handle interactions when the user staking rewards are minimal. The user still has to be able to interact with the `Payout` contract to update his receipt for a receipt of the next epoch (meaning the updated receipt has the old epoch +1).

The contract does this by not requiring the user to create a payout output at all, it only restricts how the covenant itself is recreated:

```solidity
    // Note that the Payout contract on creation is totalPayoutValue + 1000 sats
    // This way the payout contract always has enough BCH to pay out all user payouts
    int newAmountPayoutContract = tx.inputs[0].value - userPayoutAmount;
```

## Validate Function Arguments

CashScript does not automatically enforce byte length types for function arguments, see the [CashScript docs on Function Arguments](https://cashscript.org/docs/language/contracts#function-arguments) for more info.

This fact is noted in the relevant places directly next to the provided contract function arguments:

```solidity
    function borrow(
      // Note: the bytes lengths of function arguments are not automatically enforced
      bytes2 startingInterest,
      bytes5 interestManagerConfiguration
    ) {
```

## CashScript Gotchas

If an NFT is present, its capability is read together with its category by the `OP_UTXOTOKENCATEGORY` and `OP_OUTPUTTOKENCATEGORY` opcodes. The 32-byte category and 1-byte capability are  concatenated and pushed to the stack as a single 33-bytes item. This is why our CashScript contains code like the following:

```solidity
// Authenticate loan at inputIndex 1, nftCommitment checked later
require(tx.inputs[1].tokenCategory == parityTokenId + 0x01);
```

See the [CashTokens Gotchas](https://cashscript.org/docs/guides/cashtokens#cashtokens-gotchas) in the CashScript docs for more information on this and other potential surprises.

