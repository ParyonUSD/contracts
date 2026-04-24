export default {
  contractName: 'RedemptionSidecar',
  constructorInputs: [],
  abi: [
    {
      name: 'attach',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_1SUB OP_INPUTINDEX OP_OUTPOINTTXHASH OP_OVER OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPOINTINDEX OP_SWAP OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\n\n// Redemption sidecar contract. Used for both RedemptionStateSidecar and redemptionTokenSidecar\n// Tag along input, always tied to the input at activeInputIndex - 1\n\n// example of finalizeRedemption transaction:\n// 04-redemption, 05-redemptionStateSidecar, 06-redemptionTokenSidecar\n\n// The RedemptionStateSidecar holds an NFT with the following state:\n/*  --- State Immutable NFT---\n    bytes20 redeemerPkh\n    bytes4 redemptionPrice\n*/\n// The redemptionTokenSidecar holds ParyonUSD tokens and no NFT\n\ncontract RedemptionSidecar() {\n  // function attach\n  // Ties together the Redemption, the RedemptionStateSidecar and the redemptionTokenSidecar UTXOs\n\n  function attach() {\n    // Authenticate activeInputIndex - 1 to be an input part of the redemption\n    int redeemerInputIndex = this.activeInputIndex - 1;\n    require(tx.inputs[this.activeInputIndex].outpointTransactionHash == tx.inputs[redeemerInputIndex].outpointTransactionHash);\n    require(tx.inputs[this.activeInputIndex].outpointIndex == tx.inputs[redeemerInputIndex].outpointIndex + 1);\n  }\n}',
  debug: {
    bytecode: 'c08cc0c878c888c0c97cc98b9c',
    sourceMap: '22:29:22:50;:::54:1;23:22:23:43:0;:12::68:1;:82::100:0;:72::125:1;:4::127;24:22:24:43:0;:12::58:1;:72::90:0;:62::105:1;:::109;:4::111',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 23,
      },
      {
        ip: 13,
        line: 24,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:32.600Z',
} as const;
