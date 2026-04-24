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
  source: 'pragma cashscript ^0.12.0;\n\n// LoanKeyOriginProof, sidecar contract which holds the proof that the loanKey was created by the LoanKeyFactory.\n\n/*  --- Immutable NFT ---\n    no state (0x)\n*/\n\ncontract LoanKeyOriginProof() {\n    // function attach\n    // Ties together the LoanKeyOriginProof with the LoanKeyOriginEnforcer\n    //\n    // Inputs: 00-borrowing, 01-pricecontract, 02-LoanKeyOriginEnforcer, 03-LoanKeyOriginProof, 04-BchCollateral\n\n  function attach() {\n    // Enforce LoanKeyOriginProof at inputIndex 3\n    require(this.activeInputIndex == 3);\n\n    // Authenticate inputIndex 2 to be the LoanKeyOriginEnforcer\n    require(tx.inputs[2].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\n    require(tx.inputs[2].outpointIndex == tx.inputs[3].outpointIndex - 1);\n  }\n}',
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
  updatedAt: '2026-04-24T08:33:23.042Z',
} as const;
