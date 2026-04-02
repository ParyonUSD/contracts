import artifactBorrowing from './artifacts/Borrowing.js';
import artifactPriceContract from './artifacts/PriceContract.js';
import artifactLoan from './artifacts/Loan.js';
import artifactLoanSidecar from './artifacts/LoanSidecar.js';
import artifactFunctionLiquidate from './artifacts/liquidate.js';
import artifactFunctionManage from './artifacts/manage.js';
import artifactFunctionRedeem from './artifacts/redeem.js';
import artifactFunctionStartRedemption from './artifacts/startRedemption.js';
import artifactFunctionSwapInRedemption from './artifacts/swapInRedemption.js';
import artifactFunctionSwapOutRedemption from './artifacts/swapOutRedemption.js';
import artifactFunctionPayInterest from './artifacts/payInterest.js';
import artifactFunctionChangeInterest from './artifacts/changeInterest.js';
import artifactStabilityPool from './artifacts/StabilityPool.js';
import artifactStabilityPoolSidecar from './artifacts/StabilityPoolSidecar.js';
import artifactFunctionAddLiquidity from './artifacts/AddLiquidity.js';
import artifactFunctionLiquidateLoan from './artifacts/LiquidateLoan.js';
import artifactFunctionNewPeriodPool from './artifacts/NewPeriodPool.js';
import artifactFunctionWithdrawFromPool from './artifacts/WithdrawFromPool.js';
import artifactPayout from './artifacts/Payout.js';
import artifactCollector from './artifacts/Collector.js';
import artifactRedeemer from './artifacts/Redeemer.js';
import artifactRedemption from './artifacts/Redemption.js';
import artifactRedemptionSidecar from './artifacts/RedemptionSidecar.js';
import artifactLoanKeyFactory from './artifacts/LoanKeyFactory.js';
import artifactLoanKeyOriginEnforcer from './artifacts/LoanKeyOriginEnforcer.js';
import artifactLoanKeyOriginProof from './artifacts/LoanKeyOriginProof.js';

export const paryonArtifacts = {
  artifactBorrowing,
  artifactPriceContract,
  artifactLoan,
  artifactLoanSidecar,
  loanKey:{
    artifactLoanKeyFactory,
    artifactLoanKeyOriginEnforcer,
    artifactLoanKeyOriginProof
  },
  loanContractFunctions: {
    artifactFunctionLiquidate,
    artifactFunctionManage,
    artifactFunctionRedeem,
    artifactFunctionStartRedemption,
    artifactFunctionSwapInRedemption,
    artifactFunctionSwapOutRedemption,
    artifactFunctionPayInterest,
    artifactFunctionChangeInterest
  },
  stabilityPool: {
    artifactStabilityPool,
    artifactStabilityPoolSidecar,
    artifactPayout,
    artifactCollector,
    poolContractFunctions: {
      artifactFunctionAddLiquidity,
      artifactFunctionLiquidateLoan,
      artifactFunctionNewPeriodPool,
      artifactFunctionWithdrawFromPool,
    }
  },
  redeemer: {
    artifactRedeemer,
    artifactRedemption,
    artifactRedemptionSidecar
  }
}