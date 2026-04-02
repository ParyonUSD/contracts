export default {
  contractName: 'AddLiquidity',
  constructorInputs: [
    {
      name: 'paryonTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'addToPool',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_1 OP_UTXOTOKENAMOUNT OP_SUB OP_DUP 1027 OP_GREATERTHANOREQUAL OP_VERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_DROP OP_BIN2NUM OP_10 OP_DIV OP_1ADD OP_3 OP_OUTPUTTOKENCATEGORY OP_3 OP_ROLL OP_EQUALVERIFY OP_4 OP_NUM2BIN OP_SWAP OP_CAT OP_3 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_TXOUTPUTCOUNT OP_4 OP_GREATERTHAN OP_IF OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_4 OP_OUTPUTTOKENCATEGORY OP_2 OP_PICK OP_EQUAL OP_BOOLOR OP_DUP OP_VERIFY OP_DROP OP_ENDIF OP_TXOUTPUTCOUNT OP_5 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_LESSTHANOREQUAL OP_NIP',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// AddLiquidity pool contract function\r\n// Allows user to add ParyonUSD to the stabilityPool and receive a staking receipt NFT\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x01\r\n*/\r\n\r\n/*  --- State Staking Receipt Immutable NFT ---\r\n    bytes4 epochReceipt\r\n    bytes amountStakedReceipt (tokens)\r\n*/\r\n\r\n// minimumToStake = 100.00 ParyonUSD\r\n\r\n// Note: When staking, the epochReceipt is set to the next epoch (current epoch pool + 1)\r\n// Because of this, user cannot withdraw in the same epoch as they staked\r\n\r\ncontract AddLiquidity(\r\n  bytes32 paryonTokenId\r\n  ) {\r\n      // function addToPool\r\n      // Allows users to add ParyonUSD to the stabilityPool and receive a staking receipt with staked amount & next epoch recorded.\r\n      //\r\n      // Inputs: 00-stabilityPool, 01-stabilityPoolSidecar, 02-addToPool, ??-feeBch, ??-userTokens\r\n      // Outputs: 00-stabilityPool, 01-stabilityPoolSidecar, 02-addToPool, 03-receipt, ??-changeTokens, ??-changeBch\r\n\r\n    function addToPool(){\r\n      // Require function to be at inputIndex 2\r\n      require(this.activeInputIndex== 2);\r\n      \r\n      // Authenticate stabilityPool at inputIndex 0 with minting NFT\r\n      bytes stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n      require(tx.inputs[0].tokenCategory == stabilityPoolTokenId + 0x02);\r\n\r\n      // The StabilityPool itself enforces the same lockingBytecode & tokenCategory\r\n      // Pool functions need to enforce the nftCommitment & value (and tokenAmount in sidecar)\r\n\r\n      // Replicate StabilityPool value & nftCommitment\r\n      require(tx.outputs[0].value == tx.inputs[0].value, "Recreate contract at output0 - should have same BCH Balance");\r\n      require(tx.outputs[0].nftCommitment == tx.inputs[0].nftCommitment);\r\n\r\n      // Check added token amount is at least minimumToStake\r\n      // Only ParyonUSD tokens are allowed to be added to TokenSidecarPool (enforced by the StabilityPoolSidecar)\r\n      int addedTokenAmount = tx.outputs[1].tokenAmount - tx.inputs[1].tokenAmount;\r\n      require(addedTokenAmount >= 100_00);\r\n\r\n      // Recreate functionContract exactly\r\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\r\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\r\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\r\n      require(tx.outputs[2].value == 1000);\r\n\r\n      // Parse stabilitypool state\r\n      bytes4 periodPoolBytes = tx.inputs[0].nftCommitment.split(4)[0];\r\n\r\n      // Calculate next epoch for receipt because withdrawals are only allowed from the next epoch\r\n      // Divide by 10 because there\'s 10 periods per epoch\r\n      int currentEpoch = int(periodPoolBytes) / 10;\r\n      int nextEpoch = currentEpoch + 1;\r\n\r\n      // Create Receipt output at outputIndex 3\r\n      require(tx.outputs[3].tokenCategory == stabilityPoolTokenId, "Invalid receipt, should have correct tokenId");\r\n      bytes newReceipt = bytes4(nextEpoch) + bytes(addedTokenAmount);\r\n      require(tx.outputs[3].nftCommitment == newReceipt, "Invalid receipt, should have correct nftCommitment");\r\n      require(tx.outputs[3].value == 1000);\r\n\r\n      // Optionally create change output for tokens/bch at outputIndex 4\r\n      if (tx.outputs.length > 4) {\r\n        // should have paryonUsd tokens or no tokens at all\r\n        bool noTokenOrParyonTokens = tx.outputs[4].tokenCategory == 0x || tx.outputs[4].tokenCategory == paryonTokenId;\r\n        require(noTokenOrParyonTokens);\r\n      }\r\n\r\n      // Optionally create bch-change output at outputIndex 5\r\n      if (tx.outputs.length > 5) {\r\n        require(tx.outputs[5].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");\r\n      }\r\n\r\n      // Don\'t allow more outputs to prevent minting extra NFTs\r\n      require(tx.outputs.length <= 6, "Invalid number of outputs - should have 6 at most");\r\n    }\r\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce78527e8800cc00c69d00d200cf8851d351d09476021027a26952cd52c78852d252cf8852d152ce8852cc02e8039d00cf547f75815a968b53d1537a8854807c7e53d28853cc02e8039dc454a06354d1008754d15279879b76697568c455a06355d1008868c456a177',
    sourceMap: '31:14:31:35;:38::39;:6::41:1;34:45:34:66:0;:35::81:1;35:24:35:25:0;:14::40:1;:44::64:0;:67::71;:44:::1;:6::73;41:25:41:26:0;:14::33:1;:47::48:0;:37::55:1;:6::120;42:25:42:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;46:40:46:41:0;:29::54:1;:67::68:0;:57::81:1;:29;47:14:47:30:0;:34::40;:14:::1;:6::42;50:25:50:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;51:25:51:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;52:25:52:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;53:25:53:26:0;:14::33:1;:37::41:0;:6::43:1;56:41:56:42:0;:31::57:1;:64::65:0;:31::66:1;:::69;60:25:60:45;:48::50:0;:25:::1;61:22:61:38;64:25:64:26:0;:14::41:1;:45::65:0;;:6::115:1;65:25:65:42;;:51::67:0;:25::68:1;66::66:26:0;:14::41:1;:6::111;67:25:67:26:0;:14::33:1;:37::41:0;:6::43:1;70:10:70:27:0;:30::31;:10:::1;:33:74:7:0;72:48:72:49;:37::64:1;:68::70:0;:37:::1;:85::86:0;:74::101:1;:105::118:0;;:74:::1;:37;73:16:73:37:0;:8::39:1;70:33:74:7;;77:10:77:27:0;:30::31;:10:::1;:33:79:7:0;78:27:78:28;:16::43:1;:47::49:0;:8::109:1;77:33:79:7;82:14:82:31:0;:35::36;:6::91:1;29:4:83:5',
    logs: [],
    requires: [
      {
        ip: 3,
        line: 31,
      },
      {
        ip: 11,
        line: 35,
      },
      {
        ip: 16,
        line: 41,
        message: 'Recreate contract at output0 - should have same BCH Balance',
      },
      {
        ip: 21,
        line: 42,
      },
      {
        ip: 30,
        line: 47,
      },
      {
        ip: 35,
        line: 50,
      },
      {
        ip: 40,
        line: 51,
      },
      {
        ip: 45,
        line: 52,
      },
      {
        ip: 49,
        line: 53,
      },
      {
        ip: 63,
        line: 64,
        message: 'Invalid receipt, should have correct tokenId',
      },
      {
        ip: 70,
        line: 66,
        message: 'Invalid receipt, should have correct nftCommitment',
      },
      {
        ip: 74,
        line: 67,
      },
      {
        ip: 90,
        line: 73,
      },
      {
        ip: 100,
        line: 78,
        message: 'Invalid BCH change output - should not hold any tokens',
      },
      {
        ip: 105,
        line: 82,
        message: 'Invalid number of outputs - should have 6 at most',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:37.906Z',
} as const;
