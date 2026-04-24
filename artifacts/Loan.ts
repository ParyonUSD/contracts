export default {
  contractName: 'Loan',
  constructorInputs: [],
  abi: [
    {
      name: 'interact',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_1ADD OP_DUP OP_OUTPOINTTXHASH OP_INPUTINDEX OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_OUTPOINTINDEX OP_INPUTINDEX OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_INPUTINDEX OP_2 OP_ADD OP_DUP OP_UTXOTOKENCATEGORY OP_ROT OP_EQUALVERIFY OP_UTXOTOKENCOMMITMENT OP_SIZE OP_NIP OP_1 OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\n\n// Loan contract, which holds the BCH collateral for the loan\n// Always tied to a tokensidecar and a loanContractFunction\n\n// LoanTokenId (the tokenid of the loankey) state is offloaded to loanTokenSidecar by keeping an NFT with the loanTokenId\n// LoanContractFunctions are responsible for the contract logic managing the loan state & the BCH collateral\n\n/*  --- State Mutable NFT (10 items, 27 bytes) ---\n    byte identifier == 0x01\n    bytes6 borrowedTokenAmount (tokens)\n    bytes6 amountBeingRedeemed (tokens)\n    byte status (0x00 newLoan, 0x01 single period, 0x02 mature loan)\n    bytes4 lastPeriodInterestPaid\n    byte2 currentInterestRate\n    byte2 nextInterestRate\n    byte interestManager\n    bytes2 minRateManager\n    bytes2 maxRateManager\n*/\n\n// InterestManager 0x00 means no interest manager is assigned\n// Other interestManager values can be used to delegate interest management to a 3rd party \n\ncontract Loan(\n  ) {\n    function interact(){\n      // Authenticate loanTokenSidecar\n      int sidecarInputIndex = this.activeInputIndex + 1;\n      require(tx.inputs[sidecarInputIndex].outpointTransactionHash == tx.inputs[this.activeInputIndex].outpointTransactionHash);\n      require(tx.inputs[sidecarInputIndex].outpointIndex == tx.inputs[this.activeInputIndex].outpointIndex + 1);\n\n      // Authenticate Loancontract function\n      // Loan contract functions are identified by paryonTokenId + a commitment of a single byte\n      bytes32 paryonTokenId = tx.inputs[this.activeInputIndex].tokenCategory.split(32)[0];\n      int nftFunctionInputIndex = this.activeInputIndex + 2;\n      require(tx.inputs[nftFunctionInputIndex].tokenCategory == paryonTokenId);\n      bytes commitmentNftFunction = tx.inputs[nftFunctionInputIndex].nftCommitment;\n      require(commitmentNftFunction.length == 1);\n      // The mutable capability of the loan NFT must be protected by the loan contract functions.\n      // Because loans are not always self-replicating, no lockingBytecode is pinned on the function NFT input.\n    }\n}',
  debug: {
    bytecode: 'c08b76c8c0c888c9c0c98b9dc0ce01207f75c0529376ce7b88cf8277519c',
    sourceMap: '29:30:29:51;:::55:1;30:24:30:41:0;:14::66:1;:80::101:0;:70::126:1;:6::128;31:14:31:56;:70::91:0;:60::106:1;:::110;:6::112;35:40:35:61:0;:30::76:1;:83::85:0;:30::86:1;:::89;36:34:36:55:0;:58::59;:34:::1;37:24:37:45:0;:14::60:1;:64::77:0;:6::79:1;38:36:38:82;39:14:39:42;;:46::47:0;:6::49:1',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 30,
      },
      {
        ip: 11,
        line: 31,
      },
      {
        ip: 23,
        line: 37,
      },
      {
        ip: 29,
        line: 39,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:21.199Z',
} as const;
