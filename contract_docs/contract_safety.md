# Contract Safety

This is a list of items that should be checked to ensure contract safety.

## Self-Replicating Covenants
With long running covenants it's crucially important that the self-replicating logic is correctly implemented.
There are four categories of covenants:

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

- Borrowing contract
- Price contracts

### State-and-balance-mutating covenants
State-and-balance-mutating covenants are UTXOs which enforce they are recreated but both the state and bch-balance are allowed to change. These UTXOs will also always stay available from the moment of their creation.

- Stability Pool

### Conditionally-replicating covenants
Conditionally-replicating covenants are UTXOs which only conditionally enforce they are recreated. These UTXOs won't stay available indefinitely.

- Paryon Loans
- independent child contracts
  - redemptions
  - collector contract
  - payout contract

Sidecar covenants follow the type of corresponding top level contract.
But because they don't hold any state they will be either 'Always-self-replicating' or 'Conditionally-replicating'

The stability pool sidecar is 'Always-self-replicating', loan sidecars are 'Conditionally-replicating'

## Checks for Self-replicating Covenants

example from `Borrowing.cash`

Notice the 5 checks `lockingBytecode`, `tokenCategory`, `value`, `tokenAmount` & `nftCommitment`
where `tokenCategory` also checks the NFT capability

```solidity
      // Recreate contract at outputIndex0 exactly
      require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate contract at output0 - invalid lockingBytecode");
      require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");
      require(tx.outputs[0].value == 1000, "Recreate contract at output0 - needs to hold exactly 1000 sats");
      require(tx.outputs[0].nftCommitment == periodBorrowingBytes);

      // Calculate amount borrowed, enforce minimum debt
      int borrowedAmount = tx.inputs[0].tokenAmount - tx.outputs[0].tokenAmount;
      require(borrowedAmount >= 100_00, "Invalid borrowedAmount, needs to be at least minimumDebt");
```

When dealing with tokencategories which do not have fungible tokens like the StabilityPool, the redeemer or the priceContract, this `tokenAmount` check can be safely left out because there are no fungible tokens with that tokenCategory.

## Verifying Authority

Four tokens have special authority with regards to Paryon Loans namely
- loankey/managerKey
- the stability pool
- the redeemer
- the price contracts

This authority needs to be carefully validated, especially when the same tokenId can represent different authorities like in the case of the loankey/managerKey.

## Protecting Mint-Authority

With contracts holding minting NFTs, all outputs need to be carefully controlled in the covenant contract code, so no additional (minting) NFTs can unintentionally be created in other outputs.

There's 4 Mint-Authorities in ParyonUSD
- Borrowing contract
- Redeemer
- loanKey Factory
- Stability Pool (together with the created Payout contract!)

## Protecting Delegated Authority on Dumb Top-Level Contracts

`Loan.cash` and `StabilityPool.cash` are dumb top-level contracts that delegate all logic to their attached function contracts (8 and 4 respectively). As a consequence, each individual function is responsible for preventing leaks of the top-level contract's mutable-NFT capability. For loans, this is the `paryonTokenId + 0x01` capability with commitment prefix `0x01`. A single missing output check in any one function leaks that authority across the whole system.

For functions that are not exactly self-replicating (`liquidate`, `redeem`, the redemption-advancing paths), authority protection cannot rely on the top-level contract recreating itself because on those branches it doesn't. These paths must lock down every output plus the output count.

Where a loan function enforces only a subset of outputs and trusts another contract in the same transaction to lock down the rest (for example `liquidate.cash` delegating to the StabilityPool's `LiquidateLoan`), that delegation is part of the security contract and should be followed through when auditing.

## Keeping Track of Time

Keeping track of time in a covenant is difficult because there is no global information available on blockheight.

Instead there needs to be a mechanism where the old time is kept in state and this can be updated with a newer time that passes an OP_CHECKLOCKTIMEVERIFY check. This guarantees because of the transaction level locktime that this time is in the past.

In Paryon there are two places where we track time (the system period, where each period is roughly one day)
- the stability pool
- Borrowing contract

For the stability pool, the stakers and the paryon server have reason to update this period state. There is also just one UTXO so it's easy to update this by making a transaction.
For the Borrowing contract, there can be multiple UTXOs and they could even be behind in the state they are tracking. This is not a problem however as users have an incentive to update the state to the latest possible period upon interaction. Only the user loses when he borrows at an old period because he will have to make additional interest payments.

### Locktime Enforcement

Several period-advancement paths need to read the raw `nLocktime` value (for arithmetic, for writing into NFT state, or for branching), so they use `tx.locktime` rather than `tx.time`. This gives us the value-access functionality we need, but it does not carry the same built-in safety checks as `tx.time`, so those checks have to be applied explicitly. Two edges need to be handled:

**Block height vs. Unix timestamp.** `nLocktime` values below `500_000_000` are interpreted as block heights, higher values as Unix timestamps. Paryon tracks time in blocks, so every use of `tx.locktime` in period arithmetic is paired with `require(tx.locktime < 500_000_000)` to ensure the value is a block height and not a timestamp.

**Non-final sequence number.** BCH consensus only enforces `nLocktime` when at least one input has `nSequence != 0xFFFFFFFF`. If every input is "final" (`0xFFFFFFFF`), the transaction is mined regardless of the locktime value. A bare comparison against `tx.locktime` only checks the value written into the transaction, not whether consensus actually prevented the transaction from being mined before that block. To close this, each site pairs the `tx.locktime` arithmetic with:

```solidity
require(tx.time >= 0);
```

This compiles to `OP_CHECKLOCKTIMEVERIFY` with a constant value of `0`. The value check is trivially satisfied, but per BIP65 the opcode itself fails if the currently-evaluated input's `nSequence` is `0xFFFFFFFF`. That is exactly the non-final-sequence requirement we need, enforced by the opcode designed for it and bound to the right input (the one executing the script), rather than by a hand-rolled check against a specific input index.

This is applied in three call sites:

- `Borrowing.cash`: `updatePeriodState()`
- `NewPeriodPool.cash`: `newPeriod()`
- `redeem.cash`: `redeemOrCancel()`, inside the `isInNewPeriod` cancellation branch. The finalize branch is already consensus-bound via the existing `sequenceNumber == timelockRedemption` check, which pins input 3 to a specific non-final value.

### Relative Timelock Enforcement

Relative timelocks constrain how many blocks must pass between an input's UTXO being created and the transaction spending it. Paryon uses this in one place: the 12-block delay on redemption finalization (`redeem.cash`, finalize branch), which pins `tx.inputs[3].sequenceNumber == timelockRedemption`.

Note that Paryon does not use `this.age` / `OP_CHECKSEQUENCEVERIFY`. The delay is enforced on input 3 (the redemption), not on the currently-evaluated input (input 2, the redeem contract), so CSV cannot be used and the check goes through raw `sequenceNumber` introspection instead. At that level there are two edges to handle explicitly:

**Transaction version.** BCH consensus only interprets `sequenceNumber` as a relative timelock when `tx.version >= 2` (BIP68). Under version 1 the sequence field is just data and the 12-block delay would not be enforced by consensus — the script-level equality check would still pass, but the transaction could be mined immediately. `redeem.cash` therefore enforces `require(tx.version == 2)` alongside the sequence check.

**Exact equality.** The finalize branch pins the sequence with `sequenceNumber == timelockRedemption` rather than `>= timelockRedemption`. The sequence field carries a "disable" flag bit (bit 31) alongside the timelock value; a `>=` comparison would let an attacker set that flag, turning BIP68 off while still passing the script check. Exact equality rejects any extra bits.

**Value range.** BIP68 interprets only the low 16 bits of the sequence as a block count, so `timelockRedemption` must stay within `0..65535`. A higher value would cause consensus to enforce a different delay than the script specifies. The current value of 12 is well inside this range.

## Standardness rules

- Covenants shouldn't be able to commit to payout to arbitrary lockscripts (as those can be non-standard)
- Covenants can't commit to payouts below the dust limit (they're non-standard)

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

If an NFT is present, its capability is read together with its category by the `OP_UTXOTOKENCATEGORY` and `OP_OUTPUTTOKENCATEGORY` opcodes. The 32-byte category and 1-byte capability are concatenated and pushed to the stack as a single 33-byte item. This is why our CashScript contains code like the following:

```solidity
// Authenticate loan at inputIndex 1, nftCommitment checked later
require(tx.inputs[1].tokenCategory == paryonTokenId + 0x01);
```

See the [CashTokens Gotchas](https://cashscript.org/docs/guides/cashtokens#cashtokens-gotchas) in the CashScript docs for more information on this and other potential surprises.

