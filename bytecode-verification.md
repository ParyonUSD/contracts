# Bytecode Verification

This document explains how to verify that the compiled artifact bytecode has not changed since the audited third pass snapshot.

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

> **Expected post-audit mismatch:** this diff is expected to report exactly one mismatch on the `Redeemer` bytecode line, corresponding to the constant adjustment described in [Redeemer redemption-price constant](#redeemer-redemption-price-constant). That single mismatch confirms the change is present; any additional contract bytecode differences indicate unexpected drift and must be investigated. For a command that exits green, see [Green-light verification](#green-light-verification-post-fix).

## Note on artifact rename

After the audit, `artifacts/Parity.ts` was renamed to `artifacts/Borrowing.ts`. The bytecode is identical but a filename-based comparison would fail. The sorted diff above avoids this by comparing bytecode lines independent of filenames.

## What changed after the audit

Changes after the third pass are limited to documentation, comments, renaming, packaging, and one constant adjustment in `Redeemer.cash` (see below). Comment changes affect the `source` and `sourceMap` fields in artifacts but not `bytecode`. The rename changed `contractName` in `Borrowing.ts` but not its `bytecode`.

### Redeemer redemption-price constant

The `redemptionPrice` constant in `Redeemer.cash` was adjusted from `oraclePrice * 995 / 1000` to `oraclePrice * 1005 / 1000` so the computed price matches the intended 0.5% redemption fee direction.

The Redeemer bytecode changes at all only because the 0.5% factor is a hardcoded literal inside the contract rather than a constructor parameter. Constants passed via constructor parameters live outside the compiled bytecode and would not affect this check.

### Green-light verification (post-fix)

Because the audit-diff above is expected to fail on the Redeemer line, use this variant that excludes Redeemer and should exit 0:

```bash
COMMIT=9a0b98ee96d148293eeeba6e684e183958041925
diff <(git ls-tree --name-only $COMMIT:artifacts/ | grep -v '^Redeemer\.ts$' | xargs -I{} git show $COMMIT:artifacts/{} | grep "^  bytecode:" | sort) <(ls artifacts/*.ts | grep -v Redeemer | xargs grep -h "^  bytecode:" | sort) && echo "Non-Redeemer bytecodes match"
```
