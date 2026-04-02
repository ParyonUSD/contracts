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
  bytecode: 'OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_4 OP_ROLL OP_4 OP_PICK OP_ROT OP_CHECKDATASIGVERIFY OP_ROT OP_8 OP_SPLIT OP_NIP OP_4 OP_SPLIT OP_OVER OP_BIN2NUM OP_DUP OP_10 OP_MOD OP_0 OP_NUMEQUAL OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_NIP OP_4 OP_SPLIT OP_BIN2NUM OP_4 OP_PICK OP_BIN2NUM OP_OVER OP_SWAP OP_SUB OP_ABS OP_SWAP c800 OP_DIV OP_GREATERTHANOREQUAL OP_ROT OP_SWAP OP_BOOLOR OP_VERIFY OP_BIN2NUM OP_GREATERTHAN OP_VERIFY 00 OP_ROT OP_CAT OP_SWAP OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUAL OP_NIP OP_NIP OP_ELSE OP_2 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_INPUTINDEX OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_OUTPUTTOKENCOMMITMENT OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_EQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_ROT OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_ROT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUAL OP_NIP OP_ENDIF OP_ENDIF',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// Pricecontract keeps track of the latest BCH/USD price state and shares it with other contracts\r\n// The Pricecontract accepts signed price info and validates it against the oracle\'s PublicKey\r\n// Additionally the pricecontract shares its state with other contracts\r\n// The Pricecontract can be migrated to updated contract code by a MigrationKey\r\n\r\n/*  --- State Mutable NFT ---\r\n    byte identifier == 0x00\r\n    bytes4 sequence,\r\n    bytes4 pricedata\r\n    (can be extended in the future with extra fields by migrating the pricecontracts)\r\n*/\r\n\r\ncontract PriceContract(\r\n  pubkey oraclePublicKey,\r\n  bytes32 tokenIdMigrationKey\r\n  ) {\r\n    // function updatePrice\r\n    // Update the pricecontract mutable NFT state with newer oracle price data\r\n    //\r\n    // Inputs: 00-pricecontract, ?01-feeBch\r\n    // Outputs: 00-pricecontract, ?01-changeBch\r\n\r\n  function updatePrice(\r\n    // bytes16 oracleMessage\r\n    // {\r\n    //     bytes4 messageTimestamp;\r\n    //     bytes4 messageSequence;\r\n    //     bytes4 contentSequence;\r\n    //     bytes4 contentData / price;\r\n    // }\r\n    bytes oracleMessage,\r\n    datasig oracleSignature\r\n  ) {\r\n    // Require contract to be at inputIndex 0\r\n    require(this.activeInputIndex == 0, "Price contract must be at input index 0");\r\n\r\n    // Replicate price contract output \r\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate contract at output0 - invalid lockingBytecode");\r\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");\r\n    require(tx.outputs[0].value == 1000, "Recreate contract at output0 - needs to hold exactly 1000 sats");\r\n    require(tx.outputs[0].tokenAmount == 0, "Recreate contract at output0 - tokenAmount must be zero");\r\n\r\n    // Validate oracle signature against the oracle public key\r\n    require(checkDataSig(oracleSignature, oracleMessage, oraclePublicKey));\r\n\r\n    // Extract oracle message\'s content sequence and price\r\n    bytes oraclePriceInfo = oracleMessage.split(8)[1];\r\n    bytes4 oracleSeqBytes, bytes oraclePriceBytes = oraclePriceInfo.split(4);\r\n\r\n    // Heartbeat updates are the sequence numbers that are multiples of 10\r\n    int oracleSeq = int(oracleSeqBytes);\r\n    bool oracleHeartbeat = oracleSeq % 10 == 0;\r\n\r\n    // Parse contract sequence and price from the current contract state\r\n    bytes contractPriceState = tx.inputs[0].nftCommitment.split(1)[1];\r\n    bytes4 contractSeqBytes, bytes contractPriceBytes = contractPriceState.split(4);\r\n\r\n    // Calculate price deviation between old contract price and new oracle price\r\n    int oldContractPrice = int(contractPriceBytes);\r\n    int oraclePrice = int(oraclePriceBytes);\r\n    int priceDiff = abs(oldContractPrice - oraclePrice);\r\n    // Deviation threshold for oracle price difference is 0.5%\r\n    bool exceedsDeviationThreshold = priceDiff >= (oldContractPrice / 200);\r\n    \r\n    // Check whether oracle sequence is a multiple of 10 (10min heartbeat)\r\n    // Or whether the oracle price update meets deviation threshold\r\n    require(oracleHeartbeat || exceedsDeviationThreshold, "Invalid oracle sequence, should be either a heartbeat or exceed deviation threshold");\r\n\r\n    // Check oracle sequence is more recent than current price contract sequence\r\n    require(oracleSeq > int(contractSeqBytes), "Invalid oracle sequence, should be more recent than current contract sequence");\r\n\r\n    // Update state of price contract with new sequence + pricedata\r\n    // Semantic typecast of \'oraclePriceBytes\' so the concatenated result can be bytes9\r\n    bytes9 newPriceState = 0x00 + oracleSeqBytes + bytes4(oraclePriceBytes);\r\n    require(tx.outputs[0].nftCommitment == newPriceState, "Invalid nftCommitment");\r\n  }\r\n\r\n    // function sharePrice\r\n    // Provides latest oracle price to various other contracts\r\n    //\r\n    // Inputs: x-priceContract, ...\r\n    // Outputs: x-priceContract, ...\r\n\r\n  function sharePrice() {\r\n    // Recreate the contract at the corresponding output, as it was at the input\r\n    require(tx.outputs[this.activeInputIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode, "Recreate contract at corresponding output - invalid lockingBytecode");\r\n    require(tx.outputs[this.activeInputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory, "Recreate contract at corresponding output - invalid tokenCategory");\r\n    require(tx.outputs[this.activeInputIndex].value == 1000, "Recreate contract at corresponding output - needs to hold exactly 1000 sats");\r\n    require(tx.outputs[this.activeInputIndex].tokenAmount == 0, "Recreate contract at corresponding output - tokenAmount must be zero");\r\n    \r\n    // Verify price contracts keep same contract state\r\n    require(tx.outputs[this.activeInputIndex].nftCommitment == tx.inputs[this.activeInputIndex].nftCommitment, "Invalid nftCommitment, commitment should be replicated");\r\n  }\r\n\r\n    // function migrateContract\r\n    // Migrate to new PriceContract if MigrationKey is used\r\n    //\r\n    // Inputs: 00-priceContract, 01-migrationKey, ...\r\n    // Outputs: 00-newPriceContract, ...\r\n\r\n  function migrateContract() {\r\n    require(this.activeInputIndex == 0, "Price contract must be at input index 0");\r\n\r\n    // Authenticate migration at inputIndex 1\r\n    require(tx.inputs[1].tokenCategory.split(32)[0] == tokenIdMigrationKey);\r\n\r\n    // Recreate a price contract output with new contract code\r\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");\r\n    require(tx.outputs[0].value == 1000, "Recreate contract at output0 - needs to hold exactly 1000 sats");\r\n  }\r\n}',
  debug: {
    bytecode: '5279009c63c0009d00cd00c78800d100ce8800cc02e8039d00d3009d547a54797bbb7b587f77547f7881765a97009c00cf517f77547f81547981787c94907c02c80096a27b7c9b6981a06901007b7e7c7e00d2877777675279519c63c0cdc0c788c0d1c0ce88c0cc02e8039dc0d3009dc0d2c0cf87777777677b529dc0009d51ce01207f757b8800d100ce8800cc02e8039c776868',
    sourceMap: '25:2:78:3;;;;;37:12:37:33;:37::38;:4::83:1;40:23:40:24:0;:12::41:1;:55::56:0;:45::73:1;:4::133;41:23:41:24:0;:12::39:1;:53::54:0;:43::69:1;:4::127;42:23:42:24:0;:12::31:1;:35::39:0;:4::107:1;43:23:43:24:0;:12::37:1;:41::42:0;:4::103:1;46:25:46:40:0;;:42::55;;:57::72;:4::75:1;49:28:49:41:0;:48::49;:28::50:1;:::53;50:74:50:75:0;:52::76:1;53:24:53:38:0;:20::39:1;54:27:54:36:0;:39::41;:27:::1;:45::46:0;:27:::1;57:41:57:42:0;:31::57:1;:64::65:0;:31::66:1;:::69;58:81:58:82:0;:56::83:1;61:27:61:50;62:26:62:42:0;;:22::43:1;63:24:63:40:0;:43::54;:24:::1;:20::55;65:51:65:67:0;:70::73;:51:::1;:37::74;69:12:69:27:0;:31::56;:12:::1;:4::145;72:24:72:45;:12;:4::128;76:27:76:31:0;:34::48;:27:::1;:58::74:0;:27::75:1;77:23:77:24:0;:12::39:1;:4::83;25:2:78:3;;;86::95::0;;;;;88:23:88:44;:12::61:1;:75::96:0;:65::113:1;:4::186;89:23:89:44:0;:12::59:1;:73::94:0;:63::109:1;:4::180;90:23:90:44:0;:12::51:1;:55::59:0;:4::140:1;91:23:91:44:0;:12::57:1;:61::62:0;:4::136:1;94:23:94:44:0;:12::59:1;:73::94:0;:63::109:1;:4::169;86:2:95:3;;;;103::112::0;;;104:12:104:33;:37::38;:4::83:1;107:22:107:23:0;:12::38:1;:45::47:0;:12::48:1;:::51;:55::74:0;:4::76:1;110:23:110:24:0;:12::39:1;:53::54:0;:43::69:1;:4::127;111:23:111:24:0;:12::31:1;:35::39:0;:4::107:1;103:2:112:3;15:0:113:1;',
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
        ip: 69,
        line: 69,
        message: 'Invalid oracle sequence, should be either a heartbeat or exceed deviation threshold',
      },
      {
        ip: 72,
        line: 72,
        message: 'Invalid oracle sequence, should be more recent than current contract sequence',
      },
      {
        ip: 81,
        line: 77,
        message: 'Invalid nftCommitment',
      },
      {
        ip: 93,
        line: 88,
        message: 'Recreate contract at corresponding output - invalid lockingBytecode',
      },
      {
        ip: 98,
        line: 89,
        message: 'Recreate contract at corresponding output - invalid tokenCategory',
      },
      {
        ip: 102,
        line: 90,
        message: 'Recreate contract at corresponding output - needs to hold exactly 1000 sats',
      },
      {
        ip: 106,
        line: 91,
        message: 'Recreate contract at corresponding output - tokenAmount must be zero',
      },
      {
        ip: 112,
        line: 94,
        message: 'Invalid nftCommitment, commitment should be replicated',
      },
      {
        ip: 121,
        line: 104,
        message: 'Price contract must be at input index 0',
      },
      {
        ip: 128,
        line: 107,
      },
      {
        ip: 133,
        line: 110,
        message: 'Recreate contract at output0 - invalid tokenCategory',
      },
      {
        ip: 138,
        line: 111,
        message: 'Recreate contract at output0 - needs to hold exactly 1000 sats',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:29.453Z',
} as const;
