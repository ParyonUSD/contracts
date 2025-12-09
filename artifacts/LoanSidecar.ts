export default {
  contractName: 'LoanTokenSidecar',
  constructorInputs: [],
  abi: [
    {
      name: 'attach',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_1SUB OP_INPUTINDEX OP_OUTPOINTTXHASH OP_OVER OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPOINTINDEX OP_OVER OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUALVERIFY OP_DUP OP_OUTPUTTOKENCATEGORY OP_SWAP OP_UTXOTOKENCATEGORY OP_EQUAL OP_IF OP_INPUTINDEX OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPUTTOKENCOMMITMENT OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_ENDIF OP_1',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// LoanSidecar carrying the loanTokenId by holding an NFT\r\n\r\n// The NFT identifier isn\'t used anywhere, instead its tokenCategory is used to keep the loanTokenId\r\n/*  --- State Immutable NFT ---\r\n  byte identifier == 0x01\r\n*/\r\n\r\ncontract LoanTokenSidecar() {\r\n  function attach() {\r\n    // Authenticate loan at InputIndex - 1\r\n    int loanInputIndex = this.activeInputIndex - 1;\r\n    require(tx.inputs[this.activeInputIndex].outpointTransactionHash == tx.inputs[loanInputIndex].outpointTransactionHash);\r\n    require(tx.inputs[this.activeInputIndex].outpointIndex == tx.inputs[loanInputIndex].outpointIndex + 1);\r\n\r\n    // Check if loan is recreated in outputs at loanInputIndex\r\n    bool isLoanRecreated = tx.outputs[loanInputIndex].tokenCategory == tx.inputs[loanInputIndex].tokenCategory;\r\n    if(isLoanRecreated){\r\n      // Recreate loanSidecar at corresponding outputIndex\r\n      require(tx.outputs[this.activeInputIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\r\n      require(tx.outputs[this.activeInputIndex].nftCommitment == tx.inputs[this.activeInputIndex].nftCommitment);\r\n      require(tx.outputs[this.activeInputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);\r\n      require(tx.outputs[this.activeInputIndex].value == 1000);\r\n    }\r\n  }\r\n}',
  debug: {
    bytecode: 'c08cc0c878c888c0c978c98b9d76d17cce8763c0cdc0c788c0d2c0cf88c0d1c0ce88c0cc02e8039d6851',
    sourceMap: '13:25:13:46;:::50:1;14:22:14:43:0;:12::68:1;:82::96:0;:72::121:1;:4::123;15:22:15:43:0;:12::58:1;:72::86:0;:62::101:1;:::105;:4::107;18:38:18:52:0;:27::67:1;:81::95:0;:71::110:1;:27;19:23:25:5:0;21:25:21:46;:14::63:1;:77::98:0;:67::115:1;:6::117;22:25:22:46:0;:14::61:1;:75::96:0;:65::111:1;:6::113;23:25:23:46:0;:14::61:1;:75::96:0;:65::111:1;:6::113;24:25:24:46:0;:14::53:1;:57::61:0;:6::63:1;19:23:25:5;11:2:26:3',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 14,
      },
      {
        ip: 12,
        line: 15,
      },
      {
        ip: 23,
        line: 21,
      },
      {
        ip: 28,
        line: 22,
      },
      {
        ip: 33,
        line: 23,
      },
      {
        ip: 37,
        line: 24,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:40.220Z',
} as const;
