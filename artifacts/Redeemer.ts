export default {
  contractName: 'Redeemer',
  constructorInputs: [
    {
      name: 'parityTokenId',
      type: 'bytes32',
    },
    {
      name: 'redemptionLockingScript',
      type: 'bytes',
    },
    {
      name: 'tokenSidecarLockingScript',
      type: 'bytes',
    },
  ],
  abi: [
    {
      name: 'createRedemption',
      inputs: [
        {
          name: 'redeemAmountTokens',
          type: 'int',
        },
        {
          name: 'redeemerPkh',
          type: 'bytes20',
        },
      ],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_4 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_4 OP_EQUALVERIFY OP_4 OP_PICK OP_SIZE OP_NIP 14 OP_NUMEQUALVERIFY OP_3 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_4 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTBYTECODE OP_4 OP_UTXOBYTECODE OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_EQUALVERIFY OP_4 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_2 OP_UTXOTOKENCATEGORY OP_5 OP_PICK OP_6 OP_NUM2BIN OP_CAT OP_5 OP_OUTPUTVALUE 8813 OP_NUMEQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_2 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_5 OP_OUTPUTBYTECODE OP_4 OP_ROLL OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_9 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM e303 OP_MUL e803 OP_DIV OP_5 OP_ROLL OP_SWAP OP_4 OP_NUM2BIN OP_CAT OP_6 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_6 OP_OUTPUTTOKENCATEGORY OP_ROT OP_EQUALVERIFY OP_6 OP_OUTPUTBYTECODE OP_3 OP_PICK OP_EQUALVERIFY OP_6 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_7 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_7 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_7 OP_OUTPUTTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_7 OP_OUTPUTTOKENAMOUNT OP_ROT OP_NUMEQUALVERIFY OP_TXOUTPUTCOUNT OP_8 OP_GREATERTHAN OP_IF OP_8 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_8 OP_OUTPUTTOKENCATEGORY OP_2 OP_PICK OP_EQUAL OP_BOOLOR OP_DUP OP_VERIFY OP_DROP OP_ENDIF OP_TXOUTPUTCOUNT OP_9 OP_GREATERTHAN OP_IF OP_9 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_10 OP_LESSTHANOREQUAL OP_NIP',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// Redeemer contract, creates the individual redemptions for loans.\r\n\r\n/*  --- Minting NFT ---\r\n    no state (0x)\r\n*/\r\n\r\ncontract Redeemer(\r\n  bytes32 parityTokenId,\r\n  bytes redemptionLockingScript,\r\n  bytes tokenSidecarLockingScript\r\n  ) {\r\n      // function createRedemption\r\n      // Creates a redemption with two tokensidecars to keep state and hold parity tokens.\r\n      //\r\n      // Inputs: 00-PriceContract, 01-Loan, 02-loanTokenSidecar, 03-startRedemption, 04-redeemer, 0?-Parity-tokens, 0?-feeBch\r\n      // Outputs: 00-PriceContract, 01-Loan, 02-loanTokenSidecar, 03-startRedemption, 04-redeemer, 05-redemption, 06-redemptionStateSidecar, 07-redemptionTokenSidecar, ??-changeBch\r\n\r\n    function createRedemption(\r\n      int redeemAmountTokens,\r\n      // Note: the bytes length of function arguments are not automatically enforced\r\n      bytes20 redeemerPkh\r\n    ){\r\n      // Require Redeemer to be at inputIndex 4\r\n      require(this.activeInputIndex == 4);\r\n\r\n      // Authenticate PriceContract at inputIndex 0\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x00);\r\n\r\n      // Authenticate Loan at inputIndex 1\r\n      require(tx.inputs[1].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[1].nftCommitment.split(1)[0] == 0x01);\r\n\r\n      // Authenticate Redeem function NFT at inputIndex 3\r\n      require(tx.inputs[3].tokenCategory == parityTokenId);\r\n      require(tx.inputs[3].nftCommitment.split(1)[0] == 0x04);\r\n\r\n      // Validate redeemerPkh input\r\n      require(redeemerPkh.length == 20);\r\n\r\n      // Check redeemAmountTokens to be positive\r\n      // Specific minimumRedeemAmount check is done in startRedemption function\r\n      require(redeemAmountTokens > 0);\r\n\r\n      // Recreate redeemer at output index 4\r\n      require(tx.outputs[4].value == 1000);\r\n      require(tx.outputs[4].lockingBytecode == tx.inputs[4].lockingBytecode);\r\n      require(tx.outputs[4].tokenCategory == tx.inputs[4].tokenCategory);\r\n      require(tx.outputs[4].nftCommitment == 0x);\r\n      bytes32 redemptionTokenCategory = tx.inputs[4].tokenCategory.split(32)[0];\r\n\r\n      // Construct new mutable state redemption\r\n      bytes loanTokenId = tx.inputs[2].tokenCategory;\r\n      bytes6 redeemAmountTokensBytes = bytes6(redeemAmountTokens);\r\n      // Semantic typecast of \'loanTokenId\' so the concatenated result is bytes38\r\n      bytes38 mutableRedemptionState = bytes32(loanTokenId) + redeemAmountTokensBytes;\r\n\r\n      // Create redemption at output index 5\r\n      // Redemption has 5000 sats to pay for its own swapRedemption if needed\r\n      require(tx.outputs[5].value == 5000);\r\n      require(tx.outputs[5].tokenCategory == redemptionTokenCategory + 0x01);\r\n      require(tx.outputs[5].lockingBytecode == redemptionLockingScript);\r\n      require(tx.outputs[5].nftCommitment == mutableRedemptionState);\r\n\r\n      // Read latest price from PriceContract contract\r\n      bytes4 oraclePriceBytes = tx.inputs[0].nftCommitment.slice(5,9);\r\n      int oraclePrice = int(oraclePriceBytes);\r\n\r\n      // Calculate redemptionPrice which is 0.5% below oracle price\r\n      int redemptionPrice = oraclePrice * 995 / 1000;\r\n      // Construct immutable state redemptionSidecar\r\n      bytes24 redemptionSidecarState = redeemerPkh + bytes4(redemptionPrice);\r\n\r\n      // Create redemption statesidecar at output index 6\r\n      require(tx.outputs[6].value == 1000);\r\n      require(tx.outputs[6].tokenCategory == redemptionTokenCategory);\r\n      require(tx.outputs[6].lockingBytecode == tokenSidecarLockingScript);\r\n      require(tx.outputs[6].nftCommitment == redemptionSidecarState);\r\n\r\n      // Create redemption tokensidecar at output index 7\r\n      require(tx.outputs[7].value == 1000);\r\n      require(tx.outputs[7].lockingBytecode == tokenSidecarLockingScript);\r\n      require(tx.outputs[7].tokenCategory == parityTokenId);\r\n      require(tx.outputs[7].tokenAmount == redeemAmountTokens);\r\n\r\n      // Optional ninth output for token change or BCH change\r\n      if (tx.outputs.length > 8) {\r\n        // Protect minting capability\r\n        bool noTokenOrParityTokens = tx.outputs[8].tokenCategory == 0x || tx.outputs[8].tokenCategory == parityTokenId;\r\n        require(noTokenOrParityTokens);\r\n      }\r\n\r\n      // Optional tenth output for BCH change\r\n      if (tx.outputs.length > 9) {\r\n        require(tx.outputs[9].tokenCategory == 0x);\r\n      }\r\n\r\n      // Restrict maximum outputs to 10 total to protect minting capability\r\n      require(tx.outputs.length <= 10);\r\n    }\r\n}',
  debug: {
    bytecode: 'c0549d00ce78517e8800cf517f7501008851ce78517e8851cf517f75518853ce788853cf517f7554885479827701149d537900a06954cc02e8039d54cd54c78854d154ce8854d2008854ce01207f7552ce557956807e55cc0288139d55d15279517e8855cd547a8855d28800cf597f75557f778102e3039502e80396557a7c54807e56cc02e8039d56d17b8856cd53798856d28857cc02e8039d57cd7b8857d1788857d37b9dc458a06358d1008758d15279879b76697568c459a06359d1008868c45aa177',
    sourceMap: '26:14:26:35;:39::40;:6::42:1;29:24:29:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;30:24:30:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;33:24:33:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;34:24:34:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;37:24:37:25:0;:14::40:1;:44::57:0;:6::59:1;38:24:38:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;41:14:41:25:0;;:::32:1;;:36::38:0;:6::40:1;45:14:45:32:0;;:35::36;:14:::1;:6::38;48:25:48:26:0;:14::33:1;:37::41:0;:6::43:1;49:25:49:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;50:25:50:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;51:25:51:26:0;:14::41:1;:45::47:0;:6::49:1;52:50:52:51:0;:40::66:1;:73::75:0;:40::76:1;:::79;55:36:55:37:0;:26::52:1;56:46:56:64:0;;:39::65:1;;58::58:85;62:25:62:26:0;:14::33:1;:37::41:0;:6::43:1;63:25:63:26:0;:14::41:1;:45::68:0;;:71::75;:45:::1;:6::77;64:25:64:26:0;:14::43:1;:47::70:0;;:6::72:1;65:25:65:26:0;:14::41:1;:6::69;68:42:68:43:0;:32::58:1;:67::68:0;:32::69:1;;:65::66:0;:32::69:1;;69:24:69:45;72:42:72::0;:28:::1;:48::52:0;:28:::1;74:39:74:50:0;;:60::75;:53::76:1;;:39;77:25:77:26:0;:14::33:1;:37::41:0;:6::43:1;78:25:78:26:0;:14::41:1;:45::68:0;:6::70:1;79:25:79:26:0;:14::43:1;:47::72:0;;:6::74:1;80:25:80:26:0;:14::41:1;:6::69;83:25:83:26:0;:14::33:1;:37::41:0;:6::43:1;84:25:84:26:0;:14::43:1;:47::72:0;:6::74:1;85:25:85:26:0;:14::41:1;:45::58:0;:6::60:1;86:25:86:26:0;:14::39:1;:43::61:0;:6::63:1;89:10:89:27:0;:30::31;:10:::1;:33:93:7:0;91:48:91:49;:37::64:1;:68::70:0;:37:::1;:85::86:0;:74::101:1;:105::118:0;;:74:::1;:37;92:16:92:37:0;:8::39:1;89:33:93:7;;96:10:96:27:0;:30::31;:10:::1;:33:98:7:0;97:27:97:28;:16::43:1;:47::49:0;:8::51:1;96:33:98:7;101:14:101:31:0;:35::37;:6::39:1;20:4:102:5',
    logs: [],
    requires: [
      {
        ip: 5,
        line: 26,
      },
      {
        ip: 11,
        line: 29,
      },
      {
        ip: 18,
        line: 30,
      },
      {
        ip: 24,
        line: 33,
      },
      {
        ip: 31,
        line: 34,
      },
      {
        ip: 35,
        line: 37,
      },
      {
        ip: 42,
        line: 38,
      },
      {
        ip: 48,
        line: 41,
      },
      {
        ip: 53,
        line: 45,
      },
      {
        ip: 57,
        line: 48,
      },
      {
        ip: 62,
        line: 49,
      },
      {
        ip: 67,
        line: 50,
      },
      {
        ip: 71,
        line: 51,
      },
      {
        ip: 87,
        line: 62,
      },
      {
        ip: 94,
        line: 63,
      },
      {
        ip: 99,
        line: 64,
      },
      {
        ip: 102,
        line: 65,
      },
      {
        ip: 125,
        line: 77,
      },
      {
        ip: 129,
        line: 78,
      },
      {
        ip: 134,
        line: 79,
      },
      {
        ip: 137,
        line: 80,
      },
      {
        ip: 141,
        line: 83,
      },
      {
        ip: 145,
        line: 84,
      },
      {
        ip: 149,
        line: 85,
      },
      {
        ip: 153,
        line: 86,
      },
      {
        ip: 169,
        line: 92,
      },
      {
        ip: 179,
        line: 97,
      },
      {
        ip: 184,
        line: 101,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:56.421Z',
} as const;
