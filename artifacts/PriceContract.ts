export default {
  contractName: 'PriceContract',
  constructorInputs: [
    {
      name: 'oraclePublicKey',
      type: 'pubkey',
    },
    {
      name: 'tokenIdMigrationKey',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'updatePrice',
      inputs: [
        {
          name: 'oracleMessage',
          type: 'bytes',
        },
        {
          name: 'oracleSignature',
          type: 'datasig',
        },
      ],
    },
    {
      name: 'sharePrice',
      inputs: [],
    },
    {
      name: 'migrateContract',
      inputs: [],
    },
  ],
  bytecode: 'OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_4 OP_ROLL OP_4 OP_PICK OP_ROT OP_CHECKDATASIGVERIFY OP_2 OP_PICK OP_SIZE OP_NIP OP_16 OP_NUMEQUALVERIFY OP_ROT OP_8 OP_SPLIT OP_NIP OP_4 OP_SPLIT OP_OVER OP_BIN2NUM OP_DUP OP_10 OP_MOD OP_0 OP_NUMEQUAL OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_NIP OP_4 OP_SPLIT OP_BIN2NUM OP_4 OP_PICK OP_BIN2NUM OP_DUP OP_0 OP_GREATERTHAN OP_VERIFY OP_OVER OP_SWAP OP_SUB OP_ABS OP_SWAP c800 OP_DIV OP_GREATERTHANOREQUAL OP_ROT OP_SWAP OP_BOOLOR OP_VERIFY OP_BIN2NUM OP_GREATERTHAN OP_VERIFY 00 OP_ROT OP_CAT OP_SWAP OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUAL OP_NIP OP_NIP OP_ELSE OP_2 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_OUTPUTTOKENCOMMITMENT OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_EQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_ROT OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_ROT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUAL OP_NIP OP_ENDIF OP_ENDIF',
  source: 'pragma cashscript ^0.12.0;\n\n// Pricecontract keeps track of the latest BCH/USD price state and shares it with other contracts\n// The Pricecontract accepts signed price info and validates it against the oracle\'s PublicKey\n// Additionally the pricecontract shares its state with other contracts\n// The Pricecontract can be migrated to updated contract code by a MigrationKey\n\n/*  --- State Mutable NFT ---\n    byte identifier == 0x00\n    bytes4 sequence,\n    bytes4 pricedata\n    (can be extended in the future with extra fields by migrating the pricecontracts)\n*/\n\ncontract PriceContract(\n  pubkey oraclePublicKey,\n  bytes32 tokenIdMigrationKey\n  ) {\n    // function updatePrice\n    // Update the pricecontract mutable NFT state with newer oracle price data\n    //\n    // Inputs: 00-pricecontract, ?01-feeBch\n    // Outputs: 00-pricecontract, ?01-changeBch\n\n  function updatePrice(\n    // bytes16 oracleMessage\n    // {\n    //     bytes4 messageTimestamp;\n    //     bytes4 messageSequence;\n    //     bytes4 contentSequence;\n    //     bytes4 contentData / price;\n    // }\n    bytes oracleMessage,\n    datasig oracleSignature\n  ) {\n    // Require contract to be at inputIndex 0\n    require(this.activeInputIndex == 0, "Price contract must be at input index 0");\n\n    // Replicate price contract output \n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate contract at output0 - invalid lockingBytecode");\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");\n    require(tx.outputs[0].value == 1000, "Recreate contract at output0 - needs to hold exactly 1000 sats");\n    require(tx.outputs[0].tokenAmount == 0, "Recreate contract at output0 - tokenAmount must be zero");\n\n    // Validate oracle signature against the oracle public key\n    require(checkDataSig(oracleSignature, oracleMessage, oraclePublicKey));\n\n    // Length check enforces the oracle price-message format for price updates\n    require(oracleMessage.length == 16, "Oracle message must be exactly 16 bytes");\n\n    // Extract oracle message\'s content sequence and price\n    bytes oraclePriceInfo = oracleMessage.split(8)[1];\n    bytes4 oracleSeqBytes, bytes oraclePriceBytes = oraclePriceInfo.split(4);\n\n    // Heartbeat updates are the sequence numbers that are multiples of 10\n    int oracleSeq = int(oracleSeqBytes);\n    bool oracleHeartbeat = oracleSeq % 10 == 0;\n\n    // Parse contract sequence and price from the current contract state\n    bytes contractPriceState = tx.inputs[0].nftCommitment.split(1)[1];\n    bytes4 contractSeqBytes, bytes contractPriceBytes = contractPriceState.split(4);\n\n    // Calculate price deviation between old contract price and new oracle price\n    int oldContractPrice = int(contractPriceBytes);\n    int oraclePrice = int(oraclePriceBytes);\n    // Defense in depth against sign-bit / zero prices propagating to Borrowing, payInterest, liquidate\n    require(oraclePrice > 0);\n    int priceDiff = abs(oldContractPrice - oraclePrice);\n    // Deviation threshold for oracle price difference is 0.5%\n    bool exceedsDeviationThreshold = priceDiff >= (oldContractPrice / 200);\n    \n    // Check whether oracle sequence is a multiple of 10 (10min heartbeat)\n    // Or whether the oracle price update meets deviation threshold\n    require(oracleHeartbeat || exceedsDeviationThreshold, "Invalid oracle sequence, should be either a heartbeat or exceed deviation threshold");\n\n    // Check oracle sequence is more recent than current price contract sequence\n    require(oracleSeq > int(contractSeqBytes), "Invalid oracle sequence, should be more recent than current contract sequence");\n\n    // Update state of price contract with new sequence + pricedata\n    // Semantic typecast of \'oraclePriceBytes\' so the concatenated result can be bytes9\n    bytes9 newPriceState = 0x00 + oracleSeqBytes + bytes4(oraclePriceBytes);\n    require(tx.outputs[0].nftCommitment == newPriceState, "Invalid nftCommitment");\n  }\n\n    // function sharePrice\n    // Provides latest oracle price to various other contracts\n    //\n    // Inputs: x-priceContract, ...\n    // Outputs: x-priceContract, ...\n\n  function sharePrice() {\n    // Recreate the contract at the corresponding output, as it was at the input\n    require(tx.outputs[this.activeInputIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode, "Recreate contract at corresponding output - invalid lockingBytecode");\n    require(tx.outputs[this.activeInputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory, "Recreate contract at corresponding output - invalid tokenCategory");\n    require(tx.outputs[this.activeInputIndex].value == 1000, "Recreate contract at corresponding output - needs to hold exactly 1000 sats");\n    require(tx.outputs[this.activeInputIndex].tokenAmount == 0, "Recreate contract at corresponding output - tokenAmount must be zero");\n    \n    // Verify price contracts keep same contract state\n    require(tx.outputs[this.activeInputIndex].nftCommitment == tx.inputs[this.activeInputIndex].nftCommitment, "Invalid nftCommitment, commitment should be replicated");\n  }\n\n    // function migrateContract\n    // Migrate to new PriceContract if MigrationKey is used\n    //\n    // Inputs: 00-priceContract, 01-migrationKey, ...\n    // Outputs: 00-newPriceContract, ...\n\n  function migrateContract() {\n    require(this.activeInputIndex == 0, "Price contract must be at input index 0");\n\n    // Authenticate migration at inputIndex 1\n    require(tx.inputs[1].tokenCategory.split(32)[0] == tokenIdMigrationKey);\n\n    // Recreate a price contract output with new contract code\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");\n    require(tx.outputs[0].value == 1000, "Recreate contract at output0 - needs to hold exactly 1000 sats");\n  }\n}',
  debug: {
    bytecode: '5279009c63c0009d00cd00c78800d100ce8800cc02e8039d00d3009d547a54797bbb52798277609d7b587f77547f7881765a97009c00cf517f77547f815479817600a069787c94907c02c80096a27b7c9b6981a06901007b7e7c7e00d2877777675279519c63c0cdc0c788c0d1c0ce88c0cc02e8039dc0d3009dc0d2c0cf87777777677b529dc0009d51ce01207f757b8800d100ce8800cc02e8039c776868',
    sourceMap: '25:2:83:3;;;;;37:12:37:33;:37::38;:4::83:1;40:23:40:24:0;:12::41:1;:55::56:0;:45::73:1;:4::133;41:23:41:24:0;:12::39:1;:53::54:0;:43::69:1;:4::127;42:23:42:24:0;:12::31:1;:35::39:0;:4::107:1;43:23:43:24:0;:12::37:1;:41::42:0;:4::103:1;46:25:46:40:0;;:42::55;;:57::72;:4::75:1;49:12:49:25:0;;:::32:1;;:36::38:0;:4::83:1;52:28:52:41:0;:48::49;:28::50:1;:::53;53:74:53:75:0;:52::76:1;56:24:56:38:0;:20::39:1;57:27:57:36:0;:39::41;:27:::1;:45::46:0;:27:::1;60:41:60:42:0;:31::57:1;:64::65:0;:31::66:1;:::69;61:81:61:82:0;:56::83:1;64:27:64:50;65:26:65:42:0;;:22::43:1;67:12:67:23:0;:26::27;:12:::1;:4::29;68:24:68:40:0;:43::54;:24:::1;:20::55;70:51:70:67:0;:70::73;:51:::1;:37::74;74:12:74:27:0;:31::56;:12:::1;:4::145;77:24:77:45;:12;:4::128;81:27:81:31:0;:34::48;:27:::1;:58::74:0;:27::75:1;82:23:82:24:0;:12::39:1;:4::83;25:2:83:3;;;91::100::0;;;;;93:23:93:44;:12::61:1;:75::96:0;:65::113:1;:4::186;94:23:94:44:0;:12::59:1;:73::94:0;:63::109:1;:4::180;95:23:95:44:0;:12::51:1;:55::59:0;:4::140:1;96:23:96:44:0;:12::57:1;:61::62:0;:4::136:1;99:23:99:44:0;:12::59:1;:73::94:0;:63::109:1;:4::169;91:2:100:3;;;;108::117::0;;;109:12:109:33;:37::38;:4::83:1;112:22:112:23:0;:12::38:1;:45::47:0;:12::48:1;:::51;:55::74:0;:4::76:1;115:23:115:24:0;:12::39:1;:53::54:0;:43::69:1;:4::127;116:23:116:24:0;:12::31:1;:35::39:0;:4::107:1;108:2:117:3;15:0:118:1;',
    logs: [],
    requires: [
      {
        ip: 9,
        line: 37,
        message: 'Price contract must be at input index 0',
      },
      {
        ip: 14,
        line: 40,
        message: 'Recreate contract at output0 - invalid lockingBytecode',
      },
      {
        ip: 19,
        line: 41,
        message: 'Recreate contract at output0 - invalid tokenCategory',
      },
      {
        ip: 23,
        line: 42,
        message: 'Recreate contract at output0 - needs to hold exactly 1000 sats',
      },
      {
        ip: 27,
        line: 43,
        message: 'Recreate contract at output0 - tokenAmount must be zero',
      },
      {
        ip: 33,
        line: 46,
      },
      {
        ip: 39,
        line: 49,
        message: 'Oracle message must be exactly 16 bytes',
      },
      {
        ip: 67,
        line: 67,
      },
      {
        ip: 79,
        line: 74,
        message: 'Invalid oracle sequence, should be either a heartbeat or exceed deviation threshold',
      },
      {
        ip: 82,
        line: 77,
        message: 'Invalid oracle sequence, should be more recent than current contract sequence',
      },
      {
        ip: 91,
        line: 82,
        message: 'Invalid nftCommitment',
      },
      {
        ip: 103,
        line: 93,
        message: 'Recreate contract at corresponding output - invalid lockingBytecode',
      },
      {
        ip: 108,
        line: 94,
        message: 'Recreate contract at corresponding output - invalid tokenCategory',
      },
      {
        ip: 112,
        line: 95,
        message: 'Recreate contract at corresponding output - needs to hold exactly 1000 sats',
      },
      {
        ip: 116,
        line: 96,
        message: 'Recreate contract at corresponding output - tokenAmount must be zero',
      },
      {
        ip: 122,
        line: 99,
        message: 'Invalid nftCommitment, commitment should be replicated',
      },
      {
        ip: 131,
        line: 109,
        message: 'Price contract must be at input index 0',
      },
      {
        ip: 138,
        line: 112,
      },
      {
        ip: 143,
        line: 115,
        message: 'Recreate contract at output0 - invalid tokenCategory',
      },
      {
        ip: 148,
        line: 116,
        message: 'Recreate contract at output0 - needs to hold exactly 1000 sats',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:20.759Z',
} as const;
