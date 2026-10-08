# Post-Audit Contract Changes

This document describes the contract source changes made after the third pass audit that affect compiled bytecode, and how to inspect the exact opcode delta for each. For the general verification procedure see [bytecode-verification.md](bytecode-verification.md).

The issues fixed below were surfaced in a follow-up security review conducted with the latest frontier AI models. These models are rapidly changing what a small team can catch in a smart-contract review: each of the deltas below is a real soundness issue that the two external audits (one finalised and published in this repo, a second in progress) did not flag.

Six compiled artifacts differ from their audit-commit bytecode:

- `Redeemer`: [redemption-price constant](#redeemer-redemption-price-constant)
- `PriceContract`: [oracle message hardening](#pricecontract-oracle-message-hardening)
- `Borrowing`, `redeem`, `NewPeriodPool`: [tx.time locktime guard](#borrowing-redeem-newperiodpool-txtime-locktime-guard)
- `manage`: [explicit mutable-NFT burn on loan close](#manage-explicit-mutable-nft-burn-on-loan-close)

One compiled artifact is new, and has no audit-commit bytecode to differ from:

- `PriceContractGuarded`: [origin-proof NFT burn](#pricecontractguarded-origin-proof-nft-burn)

## Inspecting the opcode delta

Each artifact's `bytecode` field is a single long line, so line-based `diff` is unhelpful. To see the exact opcode(s) that changed, use `git diff --no-index --word-diff` with the space-separated opcodes as tokens:

```bash
# Resolve the audit commit from its tree hash (see bytecode-verification.md)
COMMIT=$(git log --format='%H %T' | awk '$2=="e8b122a7faa14b8beda61563a2d17cf9073dc42f" {print $1; exit}')
CONTRACT=Redeemer  # or PriceContract / Borrowing / NewPeriodPool / redeem / manage
OLD=$CONTRACT; [ "$CONTRACT" = "Borrowing" ] && OLD=Parity
git show $COMMIT:artifacts/$OLD.ts | grep "^  bytecode:" > /tmp/old.txt
grep "^  bytecode:" artifacts/$CONTRACT.ts > /tmp/new.txt
git diff --no-index --word-diff=plain --word-diff-regex='[^ ,]+' /tmp/old.txt /tmp/new.txt
```

Changes appear as `[-old-]{+new+}` tokens inline with unchanged opcodes. Swap `--word-diff=plain` for `--word-diff=color` for coloured terminal output. The `OLD=Parity` override handles the `Parity.ts` → `Borrowing.ts` post-audit rename.

## Redeemer: redemption-price constant

The `redemptionPrice` constant in `Redeemer.cash` was adjusted from `oraclePrice * 995 / 1000` to `oraclePrice * 1005 / 1000` so the computed price matches the intended 0.5% redemption fee direction.

This manifests as a single literal change in the bytecode: `e303` (995, little-endian) to `ed03` (1005, little-endian):

```
... OP_BIN2NUM [-e303-]{+ed03+} OP_MUL e803 OP_DIV ...
```

The constant is compiled into the bytecode as a literal rather than passed via a constructor parameter, which is why this change affects bytecode at all.

## PriceContract: oracle message hardening

`PriceContract.cash` was hardened against malformed oracle messages (commit `ca1e8fd`):

- Added `require(oracleMessage.length == 16)` so the split into sequence + price bytes cannot produce short or long fields.
- Added `require(oraclePrice > 0)` as defense in depth against sign-bit or zero prices propagating to Borrowing, payInterest and liquidate.

In bytecode terms, the delta is a size-check prologue (`OP_2 OP_PICK OP_SIZE OP_NIP OP_16 OP_NUMEQUALVERIFY`) inserted after the `checkDataSig`, plus an `OP_DUP OP_0 OP_GREATERTHAN OP_VERIFY` guard on the parsed price.

## Borrowing, redeem, NewPeriodPool: tx.time locktime guard

In `Borrowing.cash`, `loan/loanContractFunctions/redeem.cash` and `stabilitypool/poolContractFunctions/NewPeriodPool.cash`, the explicit sequence-number check was replaced with a `tx.time` guard (commit `deef8aa`):

```
-  require(tx.inputs[0].sequenceNumber != 4294967295);
+  require(tx.time >= 0);
```

`tx.time` compiles to an `OP_0 OP_CHECKLOCKTIMEVERIFY` prologue which enforces the non-final nSequence requirement via consensus. This closes the `tx.locktime` vs `tx.time` consensus gap: without it, a transaction with an all-final nSequence could bypass the `tx.locktime` bound because consensus only enforces nLockTime when at least one input is non-final. See `contract_docs/contract_safety.md` "Locktime Enforcement" for the full reasoning.

The bytecode delta in each of the three contracts is the insertion of `OP_0 OP_CHECKLOCKTIMEVERIFY OP_DROP` (or `OP_0 OP_CHECKLOCKTIMEVERIFY OP_2DROP` in `redeem`, where the surrounding stack layout lets the compiler fold an adjacent `OP_DROP` into a `OP_2DROP`).

## manage: explicit mutable-NFT burn on loan close

`manage.cash`'s `closeLoan` path was hardened to explicitly burn the loan's mutable-NFT capability (commit `93c753e`). On loan close, `tx.outputs[3]` is now required to be an OP_RETURN carrying the `paryonTokenId + 0x01` (mutable) category, so the mutable loan NFT cannot re-emerge on any user-controlled output. The source touches to `Loan.cash` and `liquidate.cash` in the same commit are comment-only and do not affect bytecode.

In bytecode terms, the delta is an `OP_IF`-guarded block inserted at the end of the script (reusing the `closeLoan` boolean already on the stack), plus an `OP_2DROP` → `OP_DROP` adjustment in the final stack cleanup because the boolean is now consumed by the `OP_IF`:

```
... OP_ENDIF {+OP_IF OP_3 OP_OUTPUTTOKENCATEGORY OP_5 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_OUTPUTBYTECODE 6a OP_0 OP_SIZE OP_SWAP OP_CAT OP_CAT OP_EQUALVERIFY OP_ENDIF+} OP_2DROP OP_2DROP OP_2DROP [-OP_2DROP-]{+OP_DROP+} OP_1
```

The inserted block enforces `tx.outputs[3].tokenCategory == paryonTokenId + 0x01` (category with the mutable capability byte appended) and `tx.outputs[3].lockingBytecode == <OP_RETURN, empty-data>`. See `contract_docs/contract_safety.md` "Protecting Delegated Authority on Dumb Top-Level Contracts" for the full reasoning.

## PriceContractGuarded: origin-proof NFT burn

`PriceContractGuarded.cash` is `PriceContract` with one extra check in `sharePrice`, and the same constructor parameters. It is added as an unchanged copy of `PriceContract` in one commit and changed in the next, so that second commit's diff is the whole change.

**What it enforces.** `LoanKeyFactory.create` mints an immutable loanKeyFactory NFT onto `LoanKeyOriginProof`, the origin-proof NFT. `LoanKeyOriginEnforcer` accepts the origin-proof NFT one outpoint after it as evidence that the factory created its loanKey category, by category and position only, and `LoanKeyOriginProof.attach` pins no output. `borrow` leaves its outputs 7 to 9 free for any non-paryon token, so with `PriceContract` an origin-proof NFT can survive its borrow and back a second loan with an existing loan's id. Redemptions find their loan by that id. When a borrow spends the guarded price contract, outputs 7 to 9 may hold no token, or only a token of the new loan's loanKey category without capability, read from the loan sidecar `borrow` pins at output 3. The origin-proof NFT has nowhere to go, so it is burned and each one backs exactly one loan. That covers the library's outputs there, a frontend fee, BCH change and the interest manager's immutable loanKey NFT, while minting or mutable loanKey copies and tokens of any other category are refused.

**Why in the price contract.** `Borrowing` and the loanKey contracts are fixed at genesis. The price contract can move to new code through `migrateContract`, and every spend of an origin-proof NFT includes it: the enforcer requires the Borrowing contract at input 0 and the price contract at input 1. No contract authenticates the price contract by its locking bytecode, only by its category and the `0x00` state prefix, so price threads moved to the guarded code keep working with every other contract unchanged. Every price thread has to move: a borrow can share the price from any of them, so one thread left on `PriceContract` still lets a borrow keep its origin-proof NFT.

**Why outputs 7 to 9 are enough.** `borrow` pins outputs 0 and 2 to 6 and caps the transaction at 10 outputs, and `sharePrice` recreates the price contract at its own index, output 1. The check only runs with the Borrowing contract at input 0, so every other transaction that reads the price skips it. The burn is implicit, by leaving the origin-proof NFT out of the outputs, rather than an explicit OP_RETURN burn as in `manage`: an explicit burn would take one of the three free outputs under `borrow`'s 10-output cap, which a borrow with a frontend fee, a delegated interest manager and BCH change already fills.

**No origin-proof NFT was kept before.** On mainnet no borrow has kept its origin-proof NFT, and this can be checked on-chain: every immutable loanKeyFactory NFT is either still unspent on `LoanKeyOriginProof`, or was burned by the borrow that spent it. The allow-list also relies on every loanKeyFactory minting NFT staying on `LoanKeyFactory`, so that no loan's loanKey category can be the loanKeyFactory category; on mainnet each one has only ever been on that contract. Both held at block 971,835, and still held at block 972,004, right after the migration.

**Migrated on mainnet.** All five mainnet price threads moved to `PriceContractGuarded` through `migrateContract` on 2026-10-08, in block 972,003.
