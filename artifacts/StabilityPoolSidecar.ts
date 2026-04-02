export default {
  contractName: 'StabilityPoolSidecar',
  constructorInputs: [
    {
      name: 'paryonTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'attach',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_1SUB OP_INPUTINDEX OP_OUTPOINTTXHASH OP_OVER OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPOINTINDEX OP_SWAP OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUALVERIFY OP_INPUTINDEX OP_INPUTINDEX OP_1ADD OP_UTXOTOKENCOMMITMENT OP_2 OP_EQUAL OP_IF OP_DROP OP_3 OP_ENDIF OP_DUP OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_DUP OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_DUP OP_OUTPUTTOKENCOMMITMENT OP_0 OP_EQUALVERIFY OP_DUP OP_OUTPUTTOKENCATEGORY OP_ROT OP_EQUAL OP_SWAP OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_BOOLOR',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// StabilityPoolSidecar contract holding ParyonUSD tokens for the pool\r\n// Custom sidecar allowing for special outputIndex when called from liquidateLoan function\r\n// Has extra check so it can only hold ParyonUSD tokens or no tokens at all\r\n\r\n// Holds the ParyonUSD tokens\r\n/*  --- No NFT ---  */\r\n\r\ncontract StabilityPoolSidecar(\r\n    bytes32 paryonTokenId\r\n  ) {\r\n  function attach() {\r\n    // Authenticate StabilityPool\r\n    int stabilityPoolInputIndex = this.activeInputIndex - 1;\r\n    require(tx.inputs[this.activeInputIndex].outpointTransactionHash == tx.inputs[stabilityPoolInputIndex].outpointTransactionHash);\r\n    require(tx.inputs[this.activeInputIndex].outpointIndex == tx.inputs[stabilityPoolInputIndex].outpointIndex + 1);\r\n\r\n    // Special outputIndex for liquidateLoan function\r\n    int outputIndex = this.activeInputIndex;\r\n    int nftFunctionInputIndex = this.activeInputIndex + 1;\r\n    bytes commitmentNftFunction = tx.inputs[nftFunctionInputIndex].nftCommitment;\r\n    if(commitmentNftFunction == 0x02) outputIndex = 3;\r\n\r\n    // Recreate TokenSidecar (same value, lockingBytecode, no nft)\r\n    require(tx.outputs[outputIndex].value == 1000);\r\n    require(tx.outputs[outputIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\r\n    require(tx.outputs[outputIndex].nftCommitment == 0x);\r\n\r\n    // TokenSidecar either holds paryon tokens or no tokens (zero balance)\r\n    bool hasParyonTokenId = tx.outputs[outputIndex].tokenCategory == paryonTokenId;\r\n    bool hasNoTokens = tx.outputs[outputIndex].tokenCategory == 0x;\r\n    require(hasParyonTokenId || hasNoTokens);\r\n  }\r\n}',
  debug: {
    bytecode: 'c08cc0c878c888c0c97cc98b9dc0c08bcf52876375536876cc02e8039d76cdc0c78876d2008876d17b877cd100879b',
    sourceMap: '15:34:15:55;:::59:1;16:22:16:43:0;:12::68:1;:82::105:0;:72::130:1;:4::132;17:22:17:43:0;:12::58:1;:72::95:0;:62::110:1;:::114;:4::116;20:22:20:43:0;21:32:21:53;:::57:1;22:34:22:80;23:32:23:36:0;:7:::1;:38::54:0;::::1;;;26:23:26:34:0;:12::41:1;:45::49:0;:4::51:1;27:23:27:34:0;:12::51:1;:65::86:0;:55::103:1;:4::105;28:23:28:34:0;:12::49:1;:53::55:0;:4::57:1;31:39:31:50:0;:28::65:1;:69::82:0;:28:::1;32:34:32:45:0;:23::60:1;:64::66:0;:23:::1;33:4:33:45',
    logs: [],
    requires: [
      {
        ip: 7,
        line: 16,
      },
      {
        ip: 13,
        line: 17,
      },
      {
        ip: 27,
        line: 26,
      },
      {
        ip: 32,
        line: 27,
      },
      {
        ip: 36,
        line: 28,
      },
      {
        ip: 46,
        line: 33,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:37.453Z',
} as const;
