export default {
  contractName: 'NewPeriodPool',
  constructorInputs: [
    {
      name: 'payoutLockingScript',
      type: 'bytes',
    },
    {
      name: 'collectorLockingScript',
      type: 'bytes',
    },
    {
      name: 'startBlockHeight',
      type: 'int',
    },
    {
      name: 'periodLengthBlocks',
      type: 'int',
    },
  ],
  abi: [
    {
      name: 'newPeriod',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_3 OP_UTXOTOKENCATEGORY OP_3 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT OP_2 OP_PICK OP_EQUALVERIFY OP_3 OP_UTXOVALUE OP_7 OP_SWAP OP_MUL OP_10 OP_DIV OP_ROT OP_BIN2NUM OP_DUP OP_1ADD OP_7 OP_ROLL OP_OVER OP_9 OP_ROLL OP_MUL OP_ADD OP_TXLOCKTIME OP_LESSTHANOREQUAL OP_TXLOCKTIME 0065cd1d OP_LESSTHAN OP_BOOLAND OP_VERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_1 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_DUP OP_4 OP_NUM2BIN OP_3 OP_OUTPUTBYTECODE OP_8 OP_ROLL OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_6 OP_ROLL OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_0 OP_UTXOVALUE OP_4 OP_ROLL OP_ADD 8813 OP_SUB e803 OP_MAX OP_ROT OP_10 OP_MOD OP_0 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_2 OP_PICK OP_OVER OP_6 OP_NUM2BIN OP_CAT OP_OVER OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_5 OP_OUTPUTBYTECODE OP_7 OP_PICK OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_PICK OP_5 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_6 OP_PICK OP_6 OP_SPLIT OP_2 OP_PICK e803 OP_SUB OP_8 OP_PICK OP_10 OP_DIV OP_2 OP_PICK OP_BIN2NUM OP_6 OP_NUM2BIN OP_OVER OP_4 OP_NUM2BIN OP_5 OP_PICK OP_CAT OP_OVER OP_CAT OP_3 OP_PICK OP_CAT OP_5 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_ELSE OP_0 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_OVER OP_4 OP_PICK OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_5 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_DROP OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_GREATERTHAN OP_IF OP_6 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_7 OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// NewPeriodPool pool contract function\r\n// Updates the StabilityPool to a new period and creates a new Collector contract\r\n// Every 10th period NewPeriodPool starts a new epoch and sends accumulated BCH to a new Payout contract\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x03\r\n*/\r\n\r\ncontract NewPeriodPool(\r\n    bytes payoutLockingScript,\r\n    bytes collectorLockingScript,\r\n    int startBlockHeight,\r\n    int periodLengthBlocks\r\n  ) {\r\n    // function newPeriod\r\n    // Starts a new period. Sends accumulated BCH from Collector (interest payments) and StabilityPool (liquidations) to a new Payout contract UTXO.\r\n    // StabilityPool pays for the transaction fees if possible (normally no external fee input required).\r\n    //\r\n    // Inputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-newPeriod, 03-collector, ?04-feeBch\r\n    // Outputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-newPeriod, 03-newCollector, 04-protocolFee, 05?-newPayout, ?06-BchChange\r\n\r\n    function newPeriod(){\r\n      // Require function to be at inputIndex 2\r\n      require(this.activeInputIndex== 2);\r\n\r\n      // Authenticate stabilityPool at inputIndex 0\r\n      bytes stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n      require(tx.inputs[0].tokenCategory == stabilityPoolTokenId + 0x02);\r\n\r\n      // Parse stabilitypool state\r\n      bytes4 currentPeriodPoolBytes, bytes remainingStabilityPoolState = tx.inputs[0].nftCommitment.split(4);\r\n\r\n      // Authenticate collector contract at inputIndex 3 with mutable NFT\r\n      require(tx.inputs[3].tokenCategory == stabilityPoolTokenId + 0x01);\r\n      require(tx.inputs[3].nftCommitment == currentPeriodPoolBytes);\r\n\r\n      // Reading collected interest from collector input through introspection\r\n      int totalCollectedInterest = tx.inputs[3].value;\r\n      // Calculate collected interest after protocol fee (30%)\r\n      // No need for clamping here as this value is not created as separate output amount but added to the stability pool balance\r\n      int collectedInterestAfterFee = (7 * totalCollectedInterest) / 10;\r\n\r\n      // Check if current blockheight is in new period\r\n      // We restrict locktime to below 500 million as values above are unix timestamps instead of block heights\r\n      int currentPeriodPool = int(currentPeriodPoolBytes);\r\n      int newPeriod = currentPeriodPool + 1;\r\n      int blockHeightNewPeriod = startBlockHeight + newPeriod * periodLengthBlocks;\r\n      require(tx.locktime >= blockHeightNewPeriod && tx.locktime < 500_000_000);\r\n\r\n      // The StabilityPool itself enforces the same lockingBytecode & tokenCategory\r\n      // Pool functions need to enforce the nftCommitment & value (and tokenAmount in sidecar)\r\n      // The pool enforcements happen in the \'if\' check depending on whether a new epoch is started or not\r\n      \r\n      // StabilityPoolSidecar keeps same token amount\r\n      require(tx.outputs[1].tokenAmount == tx.inputs[1].tokenAmount);\r\n\r\n      // Recreate functionContract exactly\r\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\r\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\r\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\r\n      require(tx.outputs[2].value == 1000);\r\n\r\n      // Create Collector contract at outputIndex 3\r\n      bytes4 newPeriodBytes = bytes4(newPeriod);\r\n      require(tx.outputs[3].lockingBytecode == collectorLockingScript);\r\n      require(tx.outputs[3].tokenCategory == stabilityPoolTokenId + 0x01);\r\n      require(tx.outputs[3].nftCommitment == newPeriodBytes);\r\n      require(tx.outputs[3].value == 1000);\r\n\r\n      // Protocol Fee BCH output at outputIndex 4\r\n      // Logic for protocolFee amount is enforced in Collector contract\r\n      require(tx.outputs[4].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\r\n\r\n      // Calculate new stabilitypool balance, clamp to minimum 1000 sats\r\n      int oldStabilityPoolBalance = tx.inputs[0].value;\r\n      int newStabilityPoolBalanceUnclamped = oldStabilityPoolBalance + collectedInterestAfterFee - 5000;\r\n      int newStabilityPoolBalance = max(newStabilityPoolBalanceUnclamped, 1000);\r\n\r\n      // Create Payout contract each epoch (every 10th period)\r\n      if(newPeriod % 10 == 0) {\r\n        // During Payouts StabilityPool should be recreated with 1000 sats balance\r\n        // The calculated newStabilityPoolBalance is sent to the Payout contract instead\r\n        require(tx.outputs[0].value == 1000);\r\n\r\n        // Update all state StabilityPool\r\n        int newAmountStakedEpoch = tx.outputs[1].tokenAmount;\r\n        bytes newStateStabilityPool = newPeriodBytes + bytes6(newAmountStakedEpoch) + bytes(newAmountStakedEpoch);\r\n        require(tx.outputs[0].nftCommitment == newStateStabilityPool);\r\n\r\n        // Create Payout contract at outputIndex 5\r\n        require(tx.outputs[5].lockingBytecode == payoutLockingScript);\r\n        require(tx.outputs[5].tokenCategory == tx.inputs[0].tokenCategory);\r\n        int payoutAmount = newStabilityPoolBalance;\r\n        require(tx.outputs[5].value == payoutAmount);\r\n        // nft commitment restriced below\r\n\r\n        // parse extra state from stabilityPool\r\n        bytes6 totalStakedEpochBytes, bytes remainingStakedEpochBytes = remainingStabilityPoolState.split(6);\r\n\r\n        // Calculate total payout amount minus dust as \'totalPayoutValue\' for payout contract state\r\n        int payoutAmountMinusDust = payoutAmount - 1000;\r\n\r\n        // Calculate epochPayout (uses the currentPeriodPool before incrementing to newPeriod)\r\n        int epochPayout = currentPeriodPool / 10;\r\n\r\n        // Encode variable length encoded remainingStakedEpochBytes as fixed bytes6 size\r\n        bytes6 remainingStakedEpochBytes6 = bytes6(int(remainingStakedEpochBytes));\r\n        // Construct state for payout contract\r\n        bytes payoutContractState = bytes4(epochPayout) + totalStakedEpochBytes + remainingStakedEpochBytes6 + bytes(payoutAmountMinusDust);\r\n        require(tx.outputs[5].nftCommitment == payoutContractState);\r\n      } else {\r\n        // Otherwise StabilityPool should be recreated with the new calculated balance\r\n        require(tx.outputs[0].value == newStabilityPoolBalance);\r\n\r\n        // Update period stabilityPool state, keep all other state the same\r\n        bytes newStateStabilityPool = newPeriodBytes + remainingStabilityPoolState;\r\n        require(tx.outputs[0].nftCommitment == newStateStabilityPool);\r\n\r\n        // Optionally allow output index 5 for BCH change but prevent minting extra NFTs\r\n        if(tx.outputs.length > 5){\r\n          require(tx.outputs[5].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\r\n        }\r\n      }\r\n\r\n      // Optionally create bch change output at outputIndex 6\r\n      if (tx.outputs.length > 6) {\r\n        require(tx.outputs[6].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");\r\n      }\r\n\r\n      // Don\'t allow more outputs to prevent minting extra NFTs\r\n      require(tx.outputs.length <= 7, "Invalid number of outputs - should have 7 at most");\r\n    }\r\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce78527e8800cf547f53ce5379517e8853cf52798853c6577c955a967b81768b577a78597a9593c5a1c5040065cd1d9f9a6951d351d09d52cd52c78852d252cf8852d152ce8852cc02e8039d76548053cd587a8853d1567a517e8853d2788853cc02e8039d54d1008800c6547a930288139402e803a47b5a97009c6300cc02e8039d51d352797856807e787e00d2788855cd57798855d100ce88527955cc789d5679567f527902e8039458795a96527981568078548055797e787e53797e55d278886d6d6d6d756700cc789d7854797e00d27888c455a06355d10088687568c456a06356d1008868c457a1696d6d7551',
    sourceMap: '26:14:26:35;:38::39;:6::41:1;29:45:29:66:0;:35::81:1;30:24:30:25:0;:14::40:1;:44::64:0;:67::71;:44:::1;:6::73;33:83:33:84:0;:73::99:1;:106::107:0;:73::108:1;36:24:36:25:0;:14::40:1;:44::64:0;;:67::71;:44:::1;:6::73;37:24:37:25:0;:14::40:1;:44::66:0;;:6::68:1;40:45:40:46:0;:35::53:1;43:39:43:40:0;:43::65;:39:::1;:69::71:0;:38:::1;47:34:47:56:0;:30::57:1;48:22:48:39:0;:::43:1;49:33:49:49:0;;:52::61;:64::82;;:52:::1;:33;50:14:50:25:0;:::49:1;:53::64:0;:67::78;:53:::1;:14;:6::80;57:25:57:26:0;:14::39:1;:53::54:0;:43::67:1;:6::69;60:25:60:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;61:25:61:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;62:25:62:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;63:25:63:26:0;:14::33:1;:37::41:0;:6::43:1;66:37:66:46:0;:30::47:1;;67:25:67:26:0;:14::43:1;:47::69:0;;:6::71:1;68:25:68:26:0;:14::41:1;:45::65:0;;:68::72;:45:::1;:6::74;69:25:69:26:0;:14::41:1;:45::59:0;:6::61:1;70:25:70:26:0;:14::33:1;:37::41:0;:6::43:1;74:25:74:26:0;:14::41:1;:45::47:0;:6::100:1;77:46:77:47:0;:36::54:1;78:71:78:96:0;;:45:::1;:99::103:0;:45:::1;79:74:79:78:0;:36::79:1;82:9:82:18:0;:21::23;:9:::1;:27::28:0;:9:::1;:30:113:7:0;85:27:85:28;:16::35:1;:39::43:0;:8::45:1;88:46:88:47:0;:35::60:1;89:38:89:52:0;;:62::82;:55::83:1;;:38;:92::112:0;:38::113:1;90:27:90:28:0;:16::43:1;:47::68:0;:8::70:1;93:27:93:28:0;:16::45:1;:49::68:0;;:8::70:1;94:27:94:28:0;:16::43:1;:57::58:0;:47::73:1;:8::75;95:27:95:50:0;;96::96:28;:16::35:1;:39::51:0;:8::53:1;100:72:100:99:0;;:106::107;:72::108:1;103:36:103:48:0;;:51::55;:36:::1;106:26:106:43:0;;:46::48;:26:::1;109:55:109:80:0;;:51::81:1;:44::82;;111:43:111:54:0;:36::55:1;;:58::79:0;;:36:::1;:82::108:0;:36:::1;:117::138:0;;:36::139:1;112:27:112:28:0;:16::43:1;:47::66:0;:8::68:1;82:30:113:7;;;;;113:13:125::0;115:27:115:28;:16::35:1;:39::62:0;:8::64:1;118:38:118:52:0;:55::82;;:38:::1;119:27:119:28:0;:16::43:1;:47::68:0;:8::70:1;122:11:122:28:0;:31::32;:11:::1;:33:124:9:0;123:29:123:30;:18::45:1;:49::51:0;:10::104:1;122:33:124:9;113:13:125:7;;128:10:128:27:0;:30::31;:10:::1;:33:130:7:0;129:27:129:28;:16::43:1;:47::49:0;:8::109:1;128:33:130:7;133:14:133:31:0;:35::36;:14:::1;:6::91;24:4:134:5;;;',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 26,
      },
      {
        ip: 14,
        line: 30,
      },
      {
        ip: 25,
        line: 36,
      },
      {
        ip: 30,
        line: 37,
      },
      {
        ip: 55,
        line: 50,
      },
      {
        ip: 60,
        line: 57,
      },
      {
        ip: 65,
        line: 60,
      },
      {
        ip: 70,
        line: 61,
      },
      {
        ip: 75,
        line: 62,
      },
      {
        ip: 79,
        line: 63,
      },
      {
        ip: 87,
        line: 67,
      },
      {
        ip: 94,
        line: 68,
      },
      {
        ip: 98,
        line: 69,
      },
      {
        ip: 102,
        line: 70,
      },
      {
        ip: 106,
        line: 74,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 125,
        line: 85,
      },
      {
        ip: 139,
        line: 90,
      },
      {
        ip: 144,
        line: 93,
      },
      {
        ip: 149,
        line: 94,
      },
      {
        ip: 155,
        line: 96,
      },
      {
        ip: 187,
        line: 112,
      },
      {
        ip: 197,
        line: 115,
      },
      {
        ip: 205,
        line: 119,
      },
      {
        ip: 213,
        line: 123,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 224,
        line: 129,
        message: 'Invalid BCH change output - should not hold any tokens',
      },
      {
        ip: 229,
        line: 133,
        message: 'Invalid number of outputs - should have 7 at most',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:38.845Z',
} as const;
