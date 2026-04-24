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
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_3 OP_UTXOTOKENCATEGORY OP_3 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT OP_2 OP_PICK OP_EQUALVERIFY OP_3 OP_UTXOVALUE OP_7 OP_SWAP OP_MUL OP_10 OP_DIV OP_ROT OP_BIN2NUM OP_DUP OP_1ADD OP_7 OP_ROLL OP_OVER OP_9 OP_ROLL OP_MUL OP_ADD OP_TXLOCKTIME OP_LESSTHANOREQUAL OP_TXLOCKTIME 0065cd1d OP_LESSTHAN OP_BOOLAND OP_VERIFY OP_0 OP_CHECKLOCKTIMEVERIFY OP_DROP OP_1 OP_OUTPUTTOKENAMOUNT OP_1 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_DUP OP_4 OP_NUM2BIN OP_3 OP_OUTPUTBYTECODE OP_8 OP_ROLL OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_6 OP_ROLL OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_0 OP_UTXOVALUE OP_4 OP_ROLL OP_ADD 8813 OP_SUB e803 OP_MAX OP_ROT OP_10 OP_MOD OP_0 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_2 OP_PICK OP_OVER OP_6 OP_NUM2BIN OP_CAT OP_OVER OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_5 OP_OUTPUTBYTECODE OP_7 OP_PICK OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_PICK OP_5 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_6 OP_PICK OP_6 OP_SPLIT OP_2 OP_PICK e803 OP_SUB OP_8 OP_PICK OP_10 OP_DIV OP_2 OP_PICK OP_BIN2NUM OP_6 OP_NUM2BIN OP_OVER OP_4 OP_NUM2BIN OP_5 OP_PICK OP_CAT OP_OVER OP_CAT OP_3 OP_PICK OP_CAT OP_5 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_ELSE OP_0 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_OVER OP_4 OP_PICK OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_5 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_DROP OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_GREATERTHAN OP_IF OP_6 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_7 OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1',
  source: 'pragma cashscript ^0.12.0;\n\n// NewPeriodPool pool contract function\n// Updates the StabilityPool to a new period and creates a new Collector contract\n// Every 10th period NewPeriodPool starts a new epoch and sends accumulated BCH to a new Payout contract\n\n/*  --- State Immutable NFT ---\n    byte identifier == 0x03\n*/\n\ncontract NewPeriodPool(\n    bytes payoutLockingScript,\n    bytes collectorLockingScript,\n    int startBlockHeight,\n    int periodLengthBlocks\n  ) {\n    // function newPeriod\n    // Starts a new period. Sends accumulated BCH from Collector (interest payments) and StabilityPool (liquidations) to a new Payout contract UTXO.\n    // StabilityPool pays for the transaction fees if possible (normally no external fee input required).\n    //\n    // Inputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-newPeriod, 03-collector, ?04-feeBch\n    // Outputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-newPeriod, 03-newCollector, 04-protocolFee, 05?-newPayout, ?06-BchChange\n\n    function newPeriod(){\n      // Require function to be at inputIndex 2\n      require(this.activeInputIndex== 2);\n\n      // Authenticate stabilityPool at inputIndex 0\n      bytes stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\n      require(tx.inputs[0].tokenCategory == stabilityPoolTokenId + 0x02);\n\n      // Parse stabilitypool state\n      bytes4 currentPeriodPoolBytes, bytes remainingStabilityPoolState = tx.inputs[0].nftCommitment.split(4);\n\n      // Authenticate collector contract at inputIndex 3 with mutable NFT\n      require(tx.inputs[3].tokenCategory == stabilityPoolTokenId + 0x01);\n      require(tx.inputs[3].nftCommitment == currentPeriodPoolBytes);\n\n      // Reading collected interest from collector input through introspection\n      int totalCollectedInterest = tx.inputs[3].value;\n      // Calculate collected interest after protocol fee (30%)\n      // No need for clamping here as this value is not created as separate output amount but added to the stability pool balance\n      int collectedInterestAfterFee = (7 * totalCollectedInterest) / 10;\n\n      // Check if current blockheight is in new period\n      // We restrict locktime to below 500 million as values above are unix timestamps instead of block heights\n      int currentPeriodPool = int(currentPeriodPoolBytes);\n      int newPeriod = currentPeriodPool + 1;\n      int blockHeightNewPeriod = startBlockHeight + newPeriod * periodLengthBlocks;\n      require(tx.locktime >= blockHeightNewPeriod && tx.locktime < 500_000_000);\n      // Require timelocks are enabled; see contract_safety.md "Locktime Enforcement"\n      require(tx.time >= 0);\n\n      // The StabilityPool itself enforces the same lockingBytecode & tokenCategory\n      // Pool functions need to enforce the nftCommitment & value (and tokenAmount in sidecar)\n      // The pool enforcements happen in the \'if\' check depending on whether a new epoch is started or not\n      \n      // StabilityPoolSidecar keeps same token amount\n      require(tx.outputs[1].tokenAmount == tx.inputs[1].tokenAmount);\n\n      // Recreate functionContract exactly\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\n      require(tx.outputs[2].value == 1000);\n\n      // Create Collector contract at outputIndex 3\n      bytes4 newPeriodBytes = bytes4(newPeriod);\n      require(tx.outputs[3].lockingBytecode == collectorLockingScript);\n      require(tx.outputs[3].tokenCategory == stabilityPoolTokenId + 0x01);\n      require(tx.outputs[3].nftCommitment == newPeriodBytes);\n      require(tx.outputs[3].value == 1000);\n\n      // Protocol Fee BCH output at outputIndex 4\n      // Logic for protocolFee amount is enforced in Collector contract\n      require(tx.outputs[4].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\n\n      // Calculate new stabilitypool balance, clamp to minimum 1000 sats\n      int oldStabilityPoolBalance = tx.inputs[0].value;\n      int newStabilityPoolBalanceUnclamped = oldStabilityPoolBalance + collectedInterestAfterFee - 5000;\n      int newStabilityPoolBalance = max(newStabilityPoolBalanceUnclamped, 1000);\n\n      // Create Payout contract each epoch (every 10th period)\n      if(newPeriod % 10 == 0) {\n        // During Payouts StabilityPool should be recreated with 1000 sats balance\n        // The calculated newStabilityPoolBalance is sent to the Payout contract instead\n        require(tx.outputs[0].value == 1000);\n\n        // Update all state StabilityPool\n        int newAmountStakedEpoch = tx.outputs[1].tokenAmount;\n        bytes newStateStabilityPool = newPeriodBytes + bytes6(newAmountStakedEpoch) + bytes(newAmountStakedEpoch);\n        require(tx.outputs[0].nftCommitment == newStateStabilityPool);\n\n        // Create Payout contract at outputIndex 5\n        require(tx.outputs[5].lockingBytecode == payoutLockingScript);\n        require(tx.outputs[5].tokenCategory == tx.inputs[0].tokenCategory);\n        int payoutAmount = newStabilityPoolBalance;\n        require(tx.outputs[5].value == payoutAmount);\n        // nft commitment restriced below\n\n        // parse extra state from stabilityPool\n        bytes6 totalStakedEpochBytes, bytes remainingStakedEpochBytes = remainingStabilityPoolState.split(6);\n\n        // Calculate total payout amount minus dust as \'totalPayoutValue\' for payout contract state\n        int payoutAmountMinusDust = payoutAmount - 1000;\n\n        // Calculate epochPayout (uses the currentPeriodPool before incrementing to newPeriod)\n        int epochPayout = currentPeriodPool / 10;\n\n        // Encode variable length encoded remainingStakedEpochBytes as fixed bytes6 size\n        bytes6 remainingStakedEpochBytes6 = bytes6(int(remainingStakedEpochBytes));\n        // Construct state for payout contract\n        bytes payoutContractState = bytes4(epochPayout) + totalStakedEpochBytes + remainingStakedEpochBytes6 + bytes(payoutAmountMinusDust);\n        require(tx.outputs[5].nftCommitment == payoutContractState);\n      } else {\n        // Otherwise StabilityPool should be recreated with the new calculated balance\n        require(tx.outputs[0].value == newStabilityPoolBalance);\n\n        // Update period stabilityPool state, keep all other state the same\n        bytes newStateStabilityPool = newPeriodBytes + remainingStabilityPoolState;\n        require(tx.outputs[0].nftCommitment == newStateStabilityPool);\n\n        // Optionally allow output index 5 for BCH change but prevent minting extra NFTs\n        if(tx.outputs.length > 5){\n          require(tx.outputs[5].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\n        }\n      }\n\n      // Optionally create bch change output at outputIndex 6\n      if (tx.outputs.length > 6) {\n        require(tx.outputs[6].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");\n      }\n\n      // Don\'t allow more outputs to prevent minting extra NFTs\n      require(tx.outputs.length <= 7, "Invalid number of outputs - should have 7 at most");\n    }\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce78527e8800cf547f53ce5379517e8853cf52798853c6577c955a967b81768b577a78597a9593c5a1c5040065cd1d9f9a6900b17551d351d09d52cd52c78852d252cf8852d152ce8852cc02e8039d76548053cd587a8853d1567a517e8853d2788853cc02e8039d54d1008800c6547a930288139402e803a47b5a97009c6300cc02e8039d51d352797856807e787e00d2788855cd57798855d100ce88527955cc789d5679567f527902e8039458795a96527981568078548055797e787e53797e55d278886d6d6d6d756700cc789d7854797e00d27888c455a06355d10088687568c456a06356d1008868c457a1696d6d7551',
    sourceMap: '26:14:26:35;:38::39;:6::41:1;29:45:29:66:0;:35::81:1;30:24:30:25:0;:14::40:1;:44::64:0;:67::71;:44:::1;:6::73;33:83:33:84:0;:73::99:1;:106::107:0;:73::108:1;36:24:36:25:0;:14::40:1;:44::64:0;;:67::71;:44:::1;:6::73;37:24:37:25:0;:14::40:1;:44::66:0;;:6::68:1;40:45:40:46:0;:35::53:1;43:39:43:40:0;:43::65;:39:::1;:69::71:0;:38:::1;47:34:47:56:0;:30::57:1;48:22:48:39:0;:::43:1;49:33:49:49:0;;:52::61;:64::82;;:52:::1;:33;50:14:50:25:0;:::49:1;:53::64:0;:67::78;:53:::1;:14;:6::80;52:25:52:26:0;:6::28:1;;59:25:59:26:0;:14::39:1;:53::54:0;:43::67:1;:6::69;62:25:62:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;63:25:63:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;64:25:64:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;65:25:65:26:0;:14::33:1;:37::41:0;:6::43:1;68:37:68:46:0;:30::47:1;;69:25:69:26:0;:14::43:1;:47::69:0;;:6::71:1;70:25:70:26:0;:14::41:1;:45::65:0;;:68::72;:45:::1;:6::74;71:25:71:26:0;:14::41:1;:45::59:0;:6::61:1;72:25:72:26:0;:14::33:1;:37::41:0;:6::43:1;76:25:76:26:0;:14::41:1;:45::47:0;:6::100:1;79:46:79:47:0;:36::54:1;80:71:80:96:0;;:45:::1;:99::103:0;:45:::1;81:74:81:78:0;:36::79:1;84:9:84:18:0;:21::23;:9:::1;:27::28:0;:9:::1;:30:115:7:0;87:27:87:28;:16::35:1;:39::43:0;:8::45:1;90:46:90:47:0;:35::60:1;91:38:91:52:0;;:62::82;:55::83:1;;:38;:92::112:0;:38::113:1;92:27:92:28:0;:16::43:1;:47::68:0;:8::70:1;95:27:95:28:0;:16::45:1;:49::68:0;;:8::70:1;96:27:96:28:0;:16::43:1;:57::58:0;:47::73:1;:8::75;97:27:97:50:0;;98::98:28;:16::35:1;:39::51:0;:8::53:1;102:72:102:99:0;;:106::107;:72::108:1;105:36:105:48:0;;:51::55;:36:::1;108:26:108:43:0;;:46::48;:26:::1;111:55:111:80:0;;:51::81:1;:44::82;;113:43:113:54:0;:36::55:1;;:58::79:0;;:36:::1;:82::108:0;:36:::1;:117::138:0;;:36::139:1;114:27:114:28:0;:16::43:1;:47::66:0;:8::68:1;84:30:115:7;;;;;115:13:127::0;117:27:117:28;:16::35:1;:39::62:0;:8::64:1;120:38:120:52:0;:55::82;;:38:::1;121:27:121:28:0;:16::43:1;:47::68:0;:8::70:1;124:11:124:28:0;:31::32;:11:::1;:33:126:9:0;125:29:125:30;:18::45:1;:49::51:0;:10::104:1;124:33:126:9;115:13:127:7;;130:10:130:27:0;:30::31;:10:::1;:33:132:7:0;131:27:131:28;:16::43:1;:47::49:0;:8::109:1;130:33:132:7;135:14:135:31:0;:35::36;:14:::1;:6::91;24:4:136:5;;;',
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
        ip: 57,
        line: 52,
      },
      {
        ip: 63,
        line: 59,
      },
      {
        ip: 68,
        line: 62,
      },
      {
        ip: 73,
        line: 63,
      },
      {
        ip: 78,
        line: 64,
      },
      {
        ip: 82,
        line: 65,
      },
      {
        ip: 90,
        line: 69,
      },
      {
        ip: 97,
        line: 70,
      },
      {
        ip: 101,
        line: 71,
      },
      {
        ip: 105,
        line: 72,
      },
      {
        ip: 109,
        line: 76,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 128,
        line: 87,
      },
      {
        ip: 142,
        line: 92,
      },
      {
        ip: 147,
        line: 95,
      },
      {
        ip: 152,
        line: 96,
      },
      {
        ip: 158,
        line: 98,
      },
      {
        ip: 190,
        line: 114,
      },
      {
        ip: 200,
        line: 117,
      },
      {
        ip: 208,
        line: 121,
      },
      {
        ip: 216,
        line: 125,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 227,
        line: 131,
        message: 'Invalid BCH change output - should not hold any tokens',
      },
      {
        ip: 232,
        line: 135,
        message: 'Invalid number of outputs - should have 7 at most',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:30.735Z',
} as const;
