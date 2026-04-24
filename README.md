# Paryon Contracts

This repo contains the CashScript smart contracts for ParyonUSD.
It also contains the contract documentation and schematics.

## Overview

- `contracts` - folder containing the CashScript `.cash` contract files
- `contract_docs` - documentation for the ParyonUSD smart contract system
- `contract_schematics` - schematics of the ParyonUSD smart contract system
- `audit` - smart contract audit reports
- `artifacts` - generated folder with the compiled artifacts output

## Contract Details

The ParyonUSD contract system consists of a total of 26 contracts:

<pre>
contracts/
├── loan/
│   ├── loanContractFunctions/
│   │   ├── changeInterest.cash
│   │   ├── liquidate.cash
│   │   ├── manage.cash
│   │   ├── payInterest.cash
│   │   ├── redeem.cash
│   │   ├── startRedemption.cash
│   │   ├── swapInRedemption.cash
│   │   └── swapOutRedemption.cash
│   ├── Loan.cash
│   └── LoanSidecar.cash
├── loankey/
│   ├── LoanKeyFactory.cash
│   ├── LoanKeyOriginEnforcer.cash
│   ├── LoanKeyOriginProof.cash
├── redeemer/
│   ├── Redeemer.cash
│   ├── Redemption.cash
│   └── RedemptionSidecar.cash
├── stabilitypool/
│   ├── poolContractFunctions/
│   │   ├── AddLiquidity.cash
│   │   ├── LiquidateLoan.cash
│   │   ├── NewPeriodPool.cash
│   │   └── WithdrawFromPool.cash
│   ├── Collector.cash
│   ├── Payout.cash
│   ├── StabilityPool.cash
│   └── StabilityPoolSidecar.cash
├──  Borrowing.cash
├──  PriceContract.cash
</pre>

## Re-compiling Artifacts

To recompile the CashScript Artifacts after making contract changes run

```bash
pnpm compile
```

This command generates the CashScript artifacts from the contracts source files.
The artifacts are generated as TS files to the `artifacts` folder.

Re-compiling artifacts from the same contracts source code will result in identical artifacts except for the `updatedAt` timestamp.
Changing comments in the contract source code changes the `source`, `sourceMap` and `requires` in the compiled output.

### Compiled Contract sizes

To see the compiled output sizes for the different contracts you can modify the compilation command like the following:

```ts
    const command = `cashc "${contractFile}" --size --opcount --output "${outputPath}" --format ts`;
```

Similarly, you could change the artifact output file format to `json`.

## Audit Snapshots

The contract source has been through two external audits. The first was delivered across three passes and its report is published in this repo; a second is still in progress. The table below lists the tree hashes identifying each snapshot of the finalised audit. Tree hashes are derived from repo content and are stable across history rewrites.

| Pass | Tree Hash | CashScript |
|------|-----------|------------|
| First | `873f00ce35477e775cbd66ba499179af1a47ae4a` | cashc v0.11.3 |
| Second | `7446726ac529d1b2e261b16b778e79baf8bdc1f3` | cashc v0.12.0 |
| Third | `e8b122a7faa14b8beda61563a2d17cf9073dc42f` | cashc v0.12.0 |

You can list tree hashes for all commits in the repo with:

```bash
git log --format="%T %s"
```

The current repo state includes additional hardening identified by a follow-up AI-assisted review beyond the third-pass snapshot. Six contracts' compiled bytecode has changed; the remaining 20 are bytecode-identical. See [post-audit-changes.md](post-audit-changes.md) for what changed and why, and [bytecode-verification.md](bytecode-verification.md) for how to verify the unchanged 20 against the snapshot.

## Contract Tests

There is a dedicated repo `paryon_testing_suite` for Paryon Contract tests, the transaction building tests are in the `paryon_library` repo.
