export default {
  contractName: 'LoanKeyOriginProof',
  constructorInputs: [],
  abi: [
    {
      name: 'attach',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_2 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_2 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_1SUB OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// LoanKeyOriginProof, sidecar contract which holds the proof that the loanKey was created by the LoanKeyFactory.\r\n\r\n/*  --- Immutable NFT ---\r\n    no state (0x)\r\n*/\r\n\r\ncontract LoanKeyOriginProof() {\r\n    // function attach\r\n    // Ties together the LoanKeyOriginProof with the LoanKeyOriginEnforcer\r\n    //\r\n    // Inputs: 00-parity, 01-pricecontract, 02-LoanKeyOriginEnforcer, 03-LoanKeyOriginProof, 04-BchCollateral\r\n\r\n  function attach() {\r\n    // Enforce LoanKeyOriginProof at inputIndex 3\r\n    require(this.activeInputIndex == 3);\r\n\r\n    // Authenticate inputIndex 2 to be the LoanKeyOriginEnforcer\r\n    require(tx.inputs[2].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\r\n    require(tx.inputs[2].outpointIndex == tx.inputs[3].outpointIndex - 1);\r\n  }\r\n}',
  debug: {
    bytecode: 'c0539d52c853c88852c953c98c9c',
    sourceMap: '17:12:17:33;:37::38;:4::40:1;20:22:20:23:0;:12::48:1;:62::63:0;:52::88:1;:4::90;21:22:21:23:0;:12::38:1;:52::53:0;:42::68:1;:::72;:4::74',
    logs: [],
    requires: [
      {
        ip: 2,
        line: 17,
      },
      {
        ip: 7,
        line: 20,
      },
      {
        ip: 14,
        line: 21,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:42.196Z',
} as const;
