# Bytecode Verification

This document explains how to verify that the compiled artifact bytecode matches the audited third pass snapshot for contracts whose source has not been modified post-audit. For the six contracts whose bytecode has intentionally changed since the audit, and why, see [post-audit-changes.md](post-audit-changes.md).

## Finding the audit commit

The audit snapshots are identified by git tree hashes (see the README for the full table). To find the commit matching the third pass tree hash:

```bash
git log --format="%H %T" | grep e8b122a7faa14b8beda61563a2d17cf9073dc42f
```

This returns the commit hash in the first column. Use that commit hash in the commands below.

## Comparing bytecode

Each compiled artifact file contains a top-level `bytecode` field with the compiled opcodes. This is the field that determines on-chain behavior. The `debug.bytecode` field is a hex representation of the same script and could also be used to verify. Other artifact fields can change without affecting the deployed contracts.

To compare the top-level `bytecode` fields between the audit commit and the current artifacts:

```bash
diff <(git ls-tree --name-only <commit>:artifacts/ | xargs -I{} git show <commit>:artifacts/{} | grep "^  bytecode:" | sort) <(grep -h "^  bytecode:" artifacts/*.ts | sort) && echo "All 26 contract bytecodes match"
```

> **Note:** To verify using `debug.bytecode` (hex) instead, replace `"^  bytecode:"` with `"^    bytecode:"` in the command above (4 spaces instead of 2).

> **Expected post-audit mismatches:** this diff is expected to report exactly six mismatches, on `Redeemer`, `PriceContract`, `Borrowing`, `NewPeriodPool`, `redeem` and `manage`. Each corresponds to an intentional post-audit source change described in [post-audit-changes.md](post-audit-changes.md). Any additional bytecode differences indicate unexpected drift and must be investigated.

Note that `artifacts/Parity.ts` was renamed to `artifacts/Borrowing.ts` post-audit. The sorted diff above compares bytecode lines independent of filenames, so the rename itself does not produce a spurious mismatch; however Borrowing's bytecode has also changed beyond the rename.

## CashScript compiler upgrade (v0.12 → v0.13)

The audited passes were compiled with cashc v0.12.0. The source has since been updated to the v0.13 language version, adopting new syntax such as type narrowing and the revised unsafe-cast handling, and is now compiled with cashc v0.13.0. These are source-level changes that compile to the same opcodes, so they do not change the `bytecode`.

v0.13 also turns on two compiler enforcement features by default: function-parameter-type checks (`enforceFunctionParameterTypes`) and an automatic locktime guard (`enforceLocktimeGuard`). Both would otherwise inject extra opcodes. These contracts already perform both checks by hand (see `contract_docs/contract_safety.md`: "Validate Function Arguments" and "Locktime Enforcement"), so both options are explicitly opted out of via the `-S` (`--skip-enforce-function-parameter-types`) and `-L` (`--skip-enforce-locktime-guard`) flags in `compile.ts`. The net result is that the toolchain upgrade itself changes no bytecode: the 20 contracts untouched since the audit still match their audited v0.12 artifacts, and the six intentional deltas remain exactly those described in [post-audit-changes.md](post-audit-changes.md).

## Green-light verification (post-change)

Because the audit diff above is expected to fail on the six contracts listed, use this variant which excludes them and should exit 0, confirming the remaining 20 contracts still match their audited bytecode:

```bash
# Resolve the audit commit from its tree hash (see "Finding the audit commit" above)
COMMIT=$(git log --format='%H %T' | awk '$2=="e8b122a7faa14b8beda61563a2d17cf9073dc42f" {print $1; exit}')
EXCLUDE='(^|/)(Redeemer|PriceContract|Borrowing|Parity|NewPeriodPool|redeem|manage)\.ts$'
diff \
  <(git ls-tree --name-only $COMMIT:artifacts/ | grep -Ev "$EXCLUDE" | xargs -I{} git show $COMMIT:artifacts/{} | grep "^  bytecode:" | sort) \
  <(ls artifacts/*.ts | grep -Ev "$EXCLUDE" | xargs grep -h "^  bytecode:" | sort) \
  && echo "20 unchanged contract bytecodes match audit"
```

`Parity.ts` is listed alongside `Borrowing.ts` in the exclusion regex because that is the artifact name on the audit-commit side of the diff.
