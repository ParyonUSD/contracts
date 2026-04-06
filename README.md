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

## Verifying Audit Hashes

The contract source code has been audited across three passes. The audit report identifies snapshots by their git tree hashes, which are based on repo content and are stable across history rewrites.

| Pass | Tree Hash | CashScript |
|------|-----------|------------|
| First | `873f00ce35477e775cbd66ba499179af1a47ae4a` | cashc v0.11.3 |
| Second | `7446726ac529d1b2e261b16b778e79baf8bdc1f3` | cashc v0.12.0 |
| Third | `e8b122a7faa14b8beda61563a2d17cf9073dc42f` | cashc v0.12.0 |

You can list tree hashes for all commits in the repo with:

```bash
git log --format="%T %s"
```

Changes made after the third pass do not affect the compiled artifact bytecode but do change the repo tree hash. See [bytecode-verification.md](bytecode-verification.md) for how to verify this.

## Contract Tests

There is a dedicated repo `paryon_testing_suite` for Paryon Contract tests, the transaction building tests are in the `paryon_library` repo.
