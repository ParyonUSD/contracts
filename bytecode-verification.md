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

## Note on artifact rename

After the audit, `artifacts/Parity.ts` was renamed to `artifacts/Borrowing.ts`. The bytecode is identical but a filename-based comparison would fail. The sorted diff above avoids this by comparing bytecode lines independent of filenames.

## What changed after the audit

Changes after the third pass are limited to documentation, comments, renaming and packaging. Comment changes affect the `source` and `sourceMap` fields in artifacts but not `bytecode`. The rename changed `contractName` in `Borrowing.ts` but not its `bytecode`.
