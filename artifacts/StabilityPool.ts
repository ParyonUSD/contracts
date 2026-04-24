export default {
  contractName: 'StabilityPool',
  constructorInputs: [],
  abi: [
    {
      name: 'interact',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_1ADD OP_DUP OP_OUTPOINTTXHASH OP_INPUTINDEX OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_OUTPOINTINDEX OP_INPUTINDEX OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_INPUTINDEX OP_2 OP_ADD OP_DUP OP_UTXOTOKENCATEGORY OP_ROT OP_EQUALVERIFY OP_UTXOTOKENCOMMITMENT OP_DUP OP_SIZE OP_NIP OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_SWAP OP_2 OP_EQUAL OP_IF OP_DROP OP_2 OP_ENDIF OP_DUP OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUAL',
  source: 'pragma cashscript ^0.12.0;\n\n// Contract for StabilityPool which holds the pool state and BCH earnings from liquidations\n// Always tied to a StabilityPoolSidecar and a poolContractFunction\n\n// PoolContractFunction are responsible for the contract logic updating the nft state and the BCH value\n\n/*  --- State StabilityPool Minting NFT ---\n    bytes4 periodPool\n    bytes6 totalStakedEpoch (tokens)\n    bytes remainingStakedEpoch (tokens)\n*/\n\n// totalStakedEpoch is the total amount of tokens staked in the pool for the whole epoch (so since the previous epoch change)\n// Withdrawals during the epoch are subtracted from totalStakedEpoch and new stakes during the epoch are ignored\n// remainingStakedEpoch = totalStakedEpoch - totalSpentInLiquidationsThisEpoch\n// So remainingStakedEpoch <= totalStakedEpoch\n// The remainingStakedEpoch / totalStakedEpoch ratio is used to perform pro-rata reduction of stakes for funds used in liquidations\n\n// The stabilitypool sidecar holds the remaining and newly added tokens that are not yet counted in totalStakedEpoch \n// So sidecarHoldings = remainingStakedEpoch + newlyAddedStakes\n\n// Note:\n// - In LiquidateLoan, totalStakedEpoch remains the same, remainingStakedEpoch decreases.\n// - In WithdrawFromPool, both totalStakedEpoch and remainingStakedEpoch decrease.\n// - In AddLiquidity, both totalStakedEpoch and remainingStakedEpoch remain the same, only the sidecar tokenAmount increases.\n// - In NewPeriodPool, totalStakedEpoch and remainingStakedEpoch are both set to the current staked amount in the sidecar\n//   This is because all tokens now count as staked for the new epoch and totalLiquidationThisEpoch is reset to zero.\n\ncontract StabilityPool(\n  ) {\n    function interact(){\n      // Authenticate TokenSidecar\n      int tokenSidecarInputIndex = this.activeInputIndex + 1;\n      require(tx.inputs[tokenSidecarInputIndex].outpointTransactionHash == tx.inputs[this.activeInputIndex].outpointTransactionHash);\n      require(tx.inputs[tokenSidecarInputIndex].outpointIndex == tx.inputs[this.activeInputIndex].outpointIndex + 1);\n\n      // Authenticate stabilityPool function\n      // StabilityPool contract functions are identified by stabilityPoolTokenId + a commitment of a single byte\n      bytes32 stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory.split(32)[0];\n      int nftFunctionInputIndex = this.activeInputIndex + 2;\n      require(tx.inputs[nftFunctionInputIndex].tokenCategory == stabilityPoolTokenId);\n      bytes commitmentNftFunction = tx.inputs[nftFunctionInputIndex].nftCommitment;\n      require(commitmentNftFunction.length == 1);\n\n      // Logic for stabilityPool outputIndex\n      // Normally the stabilityPool output index corresponds to stabilityPool utxo activeInputIndex\n      int outputIndex = this.activeInputIndex;\n      // However for the liquidateLoan function the outputIndex gets overwritten to be at index 2\n      // This is because in liquidateLoan the loan and loan sidecar are at inputIndex 1 and 2 are not recreated in outputs\n      // Instead, the loan liquidate functionContract goes at outputIndex 1 and the stabilityPool goes at outputIndex 2\n      if(commitmentNftFunction == 0x02) outputIndex = 2;\n\n      // Replicate StabilityPool (same lockingBytecode & tokenCategory)\n      require(tx.outputs[outputIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\n      require(tx.outputs[outputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);\n    }\n}',
  debug: {
    bytecode: 'c08b76c8c0c888c9c0c98b9dc0ce01207f75c0529376ce7b88cf768277519dc07c52876375526876cdc0c788d1c0ce87',
    sourceMap: '34:35:34:56;:::60:1;35:24:35:46:0;:14::71:1;:85::106:0;:75::131:1;:6::133;36:14:36:61;:75::96:0;:65::111:1;:::115;:6::117;40:47:40:68:0;:37::83:1;:90::92:0;:37::93:1;:::96;41:34:41:55:0;:58::59;:34:::1;42:24:42:45:0;:14::60:1;:64::84:0;:6::86:1;43:36:43:82;44:14:44:35:0;:::42:1;;:46::47:0;:6::49:1;48:24:48:45:0;52:9:52:30;:34::38;:9:::1;:40::56:0;::::1;;;55:25:55:36:0;:14::53:1;:67::88:0;:57::105:1;:6::107;56:14:56:51;:65::86:0;:55::101:1;:6::103',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 35,
      },
      {
        ip: 11,
        line: 36,
      },
      {
        ip: 23,
        line: 42,
      },
      {
        ip: 29,
        line: 44,
      },
      {
        ip: 42,
        line: 55,
      },
      {
        ip: 47,
        line: 56,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:28.839Z',
} as const;
