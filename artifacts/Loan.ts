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
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// Parity Loan contract, which hold the BCH collateral for the loan\r\n// Always tied to a tokensidecar and a loanContractFunction\r\n\r\n// LoanTokenId (the tokenid of the loankey) state is offloaded to loanTokenSidecar by keeping an NFT with the loanTokenId\r\n// LoanContractFunctions are responsible for the contract logic managing the loan state & the BCH collateral\r\n\r\n/*  --- State Mutable NFT (10 items, 27 bytes) ---\r\n    byte identifier == 0x01\r\n    bytes6 borrowedTokenAmount (tokens)\r\n    bytes6 amountBeingRedeemed (tokens)\r\n    byte status (0x00 newLoan, 0x01 single period, 0x02 mature loan)\r\n    bytes4 lastPeriodInterestPaid\r\n    byte2 currentInterestRate\r\n    byte2 nextInterestRate\r\n    byte interestManager\r\n    bytes2 minRateManager\r\n    bytes2 maxRateManager\r\n*/\r\n\r\n// InterestManager 0x00 means no interest manager is assigned\r\n// Other interestManager values can be used to delegate interest management to a 3rd party \r\n\r\ncontract Loan(\r\n  ) {\r\n    function interact(){\r\n      // Authenticate loanTokenSidecar\r\n      int sidecarInputIndex = this.activeInputIndex + 1;\r\n      require(tx.inputs[sidecarInputIndex].outpointTransactionHash == tx.inputs[this.activeInputIndex].outpointTransactionHash);\r\n      require(tx.inputs[sidecarInputIndex].outpointIndex == tx.inputs[this.activeInputIndex].outpointIndex + 1);\r\n\r\n      // Authenticate Loancontract function\r\n      // Loan contract functions are identified by parityTokenId + a commitment of a single byte\r\n      bytes32 parityTokenId = tx.inputs[this.activeInputIndex].tokenCategory.split(32)[0];\r\n      int nftFunctionInputIndex = this.activeInputIndex + 2;\r\n      require(tx.inputs[nftFunctionInputIndex].tokenCategory == parityTokenId);\r\n      bytes commitmentNftFunction = tx.inputs[nftFunctionInputIndex].nftCommitment;\r\n      require(commitmentNftFunction.length == 1);\r\n    }\r\n}',
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
  updatedAt: '2025-12-09T07:06:39.538Z',
} as const;
