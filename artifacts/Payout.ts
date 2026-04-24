export default {
  contractName: 'Payout',
  constructorInputs: [],
  abi: [
    {
      name: 'claimPayout',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_6 OP_SPLIT OP_6 OP_SPLIT OP_0 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_1 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_6 OP_ROLL OP_BIN2NUM OP_ROT OP_BIN2NUM OP_OVER OP_NUMEQUALVERIFY OP_5 OP_ROLL OP_BIN2NUM OP_ROT OP_BIN2NUM OP_4 OP_ROLL OP_BIN2NUM OP_OVER OP_MUL OP_2 OP_PICK OP_DIV OP_0 OP_UTXOVALUE OP_SWAP OP_SUB OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_NUMEQUALVERIFY OP_4 OP_ROLL OP_BIN2NUM OP_MUL OP_SWAP OP_DIV OP_SWAP OP_1ADD OP_4 OP_NUM2BIN OP_SWAP OP_CAT OP_1 OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_DUP OP_0 OP_EQUAL OP_NOTIF OP_DUP 20 OP_SPLIT OP_DROP OP_2 OP_PICK OP_EQUAL OP_NOT OP_VERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_3 OP_LESSTHANOREQUAL OP_NIP OP_NIP',
  source: 'pragma cashscript ^0.12.0;\n\n// Contract to payout rewards stability pool to stakers\n// One Payout contract is created per epoch in (every 10th invocation of) the \'NewPeriodPool\' function of the StabilityPool\n// The Payout contract holds the total BCH earned by the Stability Pool in that epoch (interest + liquidation earnings)\n// Stakers receive pro-rata share earnings (interest + liquidation earnings) for that epoch based on their stake\n// When liquidations take place, all stakes are reduced proportionally for the amount of stability pool funds spent in liquidations\n\n/*  --- State Payout Minting NFT ---\n    bytes4 epochPayoutContract\n    bytes6 totalStakedEpoch (tokens)\n    bytes6 remainingStakedEpoch (tokens)\n    bytes totalPayoutValue (BCH)\n*/\n\n// Note: totalPayoutValue ≈ sum(all userPayouts) (minus rounding dust)\n// because userPayoutAmount = totalValue × userStaked / totalStaked\n\n/*  --- State Staking Receipt Immutable NFT ---\n    bytes4 epochReceipt\n    bytes amountStakedReceipt (tokens)\n*/\n\ncontract Payout() {\n    // function claimPayout\n    // Allows stakers to claim the portion of the interest and liquidation earnings they are entitled to for the epoch.\n    //\n    // Inputs: 00-Payout, 01-userReceipt, ?02-feeBch\n    // Outputs: 00-Payout, 01-newUserReceipt, 02-userBchPayout\n\n  function claimPayout() {\n    // Require contract to be at inputIndex 0\n    require(this.activeInputIndex == 0, "Payout contract must always be at input index 0");\n\n    // Parse state Payout contract\n    bytes4 epochPayoutBytes, bytes remainingState = tx.inputs[0].nftCommitment.split(4);\n    bytes6 totalStakedEpochBytes, bytes remainingState2 = remainingState.split(6);\n    bytes6 remainingStakedEpochBytes, bytes totalPayoutValueBytes = remainingState2.split(6);\n\n    // Authenticate staking receipt\n    bytes32 stabilityPoolTokenId = tx.inputs[0].tokenCategory.split(32)[0];\n    require(tx.inputs[1].tokenCategory == stabilityPoolTokenId, "Invalid staking receipt, should have correct tokenId");\n\n    // Parse state staking receipt\n    bytes4 epochReceiptBytes, bytes amountStakedReceiptBytes = tx.inputs[1].nftCommitment.split(4);\n\n    // Check epoch receipt to be the same as the payout contract epoch state\n    int epochPayout = int(epochPayoutBytes);\n    int epochReceipt = int(epochReceiptBytes);\n    require(epochReceipt == epochPayout, "Invalid staking receipt, should be from the correct epoch");\n\n    // Convert bytes to int for follow up calculations\n    int totalStakedEpoch = int(totalStakedEpochBytes);\n    int amountStakedReceipt = int(amountStakedReceiptBytes);\n\n    // Calculate user payout amount\n    // Pro-rata BCH payout: userShare = totalValue × userStaked / totalStaked\n    // Note: division by zero never happens as the totalStaked can only be zero if no one has a staking receipt for this epoch\n    int userPayoutAmount = int(totalPayoutValueBytes) * amountStakedReceipt / totalStakedEpoch;\n    \n    // Note that the Payout contract on creation is totalPayoutValue + 1000 sats\n    // This way the payout contract always has enough BCH to pay out all user payouts\n    int newAmountPayoutContract = tx.inputs[0].value - userPayoutAmount;\n    \n    // Recreate Payout contract with lower bch amount at outputIndex 0\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");\n    require(tx.outputs[0].nftCommitment == tx.inputs[0].nftCommitment, "Recreate contract at output0 - invalid nftCommitment");\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate contract at output0 - invalid lockingBytecode");\n    require(tx.outputs[0].value == newAmountPayoutContract, "Recreate contract at output0 - invalid BCH amount");\n\n    // Construct new receipt state\n    int remainingStakedEpoch = int(remainingStakedEpochBytes);\n    // Pro-rata reduction of stakes: newStake = oldStake × (remaining / total)\n    // This reduces user\'s stake proportionally to pool\'s funds spent in liquidations\n    int newAmountStaked = amountStakedReceipt * remainingStakedEpoch / totalStakedEpoch;\n    int newEpochReceipt = epochPayout + 1;\n    bytes newReceipt = bytes4(newEpochReceipt) + bytes(newAmountStaked);\n\n    // Create new user receipt output at outputIndex 1\n    require(tx.outputs[1].tokenCategory == tx.inputs[1].tokenCategory);\n    require(tx.outputs[1].nftCommitment == newReceipt, "Invalid new receipt, should have correct nftCommitment");\n    require(tx.outputs[1].value == 1000, "Invalid tokenoutput - needs to hold exactly 1000 sats");\n\n    // User Bch Payout output at outputIndex 2\n    // Allow for token category, disallow for StabilityPool/Payout category to be used\n    // Enables future extension of automatic payout distribution contract\n    bytes tokenCategoryOutput2 = tx.outputs[2].tokenCategory;\n    if(tokenCategoryOutput2 != 0x) require(tokenCategoryOutput2.split(32)[0] != stabilityPoolTokenId);\n\n    // Don\'t allow more outputs to prevent minting extra NFTs.\n    require(tx.outputs.length <= 3, "Invalid number of outputs - should have 3 at most");\n  }\n}',
  debug: {
    bytecode: 'c0009d00cf547f567f567f00ce01207f7551ce788851cf547f567a817b81789d557a817b81547a81789552799600c67c9400d100ce8800d200cf8800cd00c78800cc9d547a81957c967c8b54807c7e51d151ce8851d28851cc02e8039d52d1760087647601207f75527987916968c453a17777',
    sourceMap: '33:12:33:33;:37::38;:4::91:1;36:62:36:63:0;:52::78:1;:85::86:0;:52::87:1;37:79:37:80:0;:58::81:1;38:90:38:91:0;:68::92:1;41:45:41:46:0;:35::61:1;:68::70:0;:35::71:1;:::74;42:22:42:23:0;:12::38:1;:42::62:0;:4::120:1;45:73:45:74:0;:63::89:1;:96::97:0;:63::98:1;48:26:48:42:0;;:22::43:1;49:27:49:44:0;:23::45:1;50:28:50:39:0;:4::102:1;53:31:53:52:0;;:27::53:1;54:34:54:58:0;:30::59:1;59:31:59:52:0;;:27::53:1;:56::75:0;:27:::1;:78::94:0;;:27:::1;63:44:63:45:0;:34::52:1;:55::71:0;:34:::1;66:23:66:24:0;:12::39:1;:53::54:0;:43::69:1;:4::127;67:23:67:24:0;:12::39:1;:53::54:0;:43::69:1;:4::127;68:23:68:24:0;:12::41:1;:55::56:0;:45::73:1;:4::133;69:23:69:24:0;:12::31:1;:4::113;72:35:72:60:0;;:31::61:1;75:26:75:68;:71::87:0;:26:::1;76::76:37:0;:::41:1;77:23:77:46;;:55::70:0;:23::71:1;80::80:24:0;:12::39:1;:53::54:0;:43::69:1;:4::71;81:23:81:24:0;:12::39:1;:4::113;82:23:82:24:0;:12::31:1;:35::39:0;:4::98:1;87:44:87:45:0;:33::60:1;88:7:88:27:0;:31::33;:7:::1;:::102:0;:43::63;:70::72;:43::73:1;:::76;:80::100:0;;:43:::1;;:35::102;;91:12:91:29:0;:33::34;:4::89:1;31:2:92:3;',
    logs: [],
    requires: [
      {
        ip: 2,
        line: 33,
        message: 'Payout contract must always be at input index 0',
      },
      {
        ip: 19,
        line: 42,
        message: 'Invalid staking receipt, should have correct tokenId',
      },
      {
        ip: 30,
        line: 50,
        message: 'Invalid staking receipt, should be from the correct epoch',
      },
      {
        ip: 52,
        line: 66,
        message: 'Recreate contract at output0 - invalid tokenCategory',
      },
      {
        ip: 57,
        line: 67,
        message: 'Recreate contract at output0 - invalid nftCommitment',
      },
      {
        ip: 62,
        line: 68,
        message: 'Recreate contract at output0 - invalid lockingBytecode',
      },
      {
        ip: 65,
        line: 69,
        message: 'Recreate contract at output0 - invalid BCH amount',
      },
      {
        ip: 82,
        line: 80,
      },
      {
        ip: 85,
        line: 81,
        message: 'Invalid new receipt, should have correct nftCommitment',
      },
      {
        ip: 89,
        line: 82,
        message: 'Invalid tokenoutput - needs to hold exactly 1000 sats',
      },
      {
        ip: 104,
        line: 88,
      },
      {
        ip: 109,
        line: 91,
        message: 'Invalid number of outputs - should have 3 at most',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:28.378Z',
} as const;
