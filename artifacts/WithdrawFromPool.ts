export default {
  contractName: 'WithdrawFromPool',
  constructorInputs: [],
  abi: [
    {
      name: 'withdraw',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_6 OP_SPLIT OP_3 OP_UTXOTOKENCATEGORY OP_4 OP_ROLL OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_SWAP OP_BIN2NUM OP_4 OP_PICK OP_BIN2NUM OP_10 OP_DIV OP_NUMEQUALVERIFY OP_ROT OP_BIN2NUM OP_ROT OP_BIN2NUM OP_ROT OP_BIN2NUM OP_2 OP_PICK OP_OVER OP_SUB OP_SWAP OP_2 OP_PICK OP_MUL OP_3 OP_ROLL OP_DIV OP_2 OP_PICK OP_OVER OP_SUB OP_4 OP_ROLL OP_3 OP_ROLL OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_UTXOTOKENAMOUNT OP_OVER OP_SUB OP_1 OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENAMOUNT OP_OVER OP_NUMEQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_EQUALVERIFY OP_0 OP_UTXOVALUE OP_DUP e803 OP_SUB OP_ROT OP_MUL OP_ROT OP_DIV OP_4 OP_OVER e803 OP_GREATERTHAN OP_IF OP_DROP OP_5 OP_4 OP_OUTPUTVALUE OP_2 OP_PICK OP_NUMEQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_2 OP_PICK OP_2 OP_PICK OP_SUB OP_0 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_DROP OP_ELSE OP_0 OP_OUTPUTVALUE OP_3 OP_PICK OP_NUMEQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_OVER OP_GREATERTHAN OP_IF OP_DUP OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_SWAP OP_1ADD OP_LESSTHANOREQUAL OP_NIP OP_NIP',
  source: 'pragma cashscript ^0.12.0;\n\n// WithdrawFromPool pool contract function\n// Allows user to withdraw ParyonUSD from the stabilityPool by returning their staking receipt NFT\n// To withdraw, the staking receipt should have a receipt with an epochReceipt matching the current pool epoch\n// The epochReceipt and amountStakedReceipt are updated by the Payout contract and accounts for any funds used in liquidations\n// Any BCH earnings of the StabilityPool in this epoch are paid out pro-rata to the withdrawer based on their stake share\n// if liquidations were processed in this epoch, the withdrawer also gets their stake reduced proportionally to the amount of funds spent in liquidations\n// The full share of the remaining staked funds for the receipt must be withdrawn, partial withdrawals are not supported\n\n/*  --- State Immutable NFT ---\n    byte identifier == 0x04\n*/\n\n/*  --- State Staking Receipt Immutable NFT ---\n    bytes4 epochReceipt\n    bytes amountStakedReceipt (tokens)\n*/\n\n// Note: In the unlikely event of an empty stability pool when all pool funds spent in liquidations\n// then early withdrawal of BCH earnings is not possible, only through the Payout contract at the end of the epoch\n\n// Note on arithmetic and rounding:\n// - Division is integer division and truncates toward 0 (effectively floor for non-negative values)\n// - When we compute ratio-based amounts, we multiply first and divide last to retain maximum precision\n// - There are two ratio based calculations: reducedWithdrawalAmount and proRataPoolEarnings\n// - For reducedWithdrawalAmount token amount values are rounded down to the nearest token unit, so by at most 0.01 ParyonUSD\n// - For BCH earnings (proRataPoolEarnings) the result is rounded down by at most 1 sat\n// - Overall, rounding is conservative: the pool never overpays out tokens or BCH earnings\n//   Rounding only affects how the last cent/satoshi of the fixed pool is split between users and how much remains as dust\n\ncontract WithdrawFromPool(\n  ) {\n    // function withdraw\n    // Allows ParyonUSD stakers to withdraw their tokens from the StabilityPool, pro-rata BCH earnings and stake reduction are applied at withdrawal.\n    //\n    // Inputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-WithdrawFromPool, 03-userReceipt, 04-feeBch\n    // Outputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-WithdrawFromPool, 03-withdrawnTokens, ?04-stakeEarningsBch, ?04/05-changeBch\n\n    function withdraw(){\n      // Require function to be at inputIndex 2\n      require(this.activeInputIndex== 2);\n\n      // Authenticate stabilityPool at inputIndex 0\n      bytes stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\n      require(tx.inputs[0].tokenCategory == stabilityPoolTokenId + 0x02);\n\n      // Parse stabilitypool state\n      bytes4 periodPoolBytes, bytes remainingState = tx.inputs[0].nftCommitment.split(4);\n      bytes6 totalStakedEpochBytes, bytes remainingStakedEpochBytes = remainingState.split(6);\n\n      // Authenticate staking receipt\n      require(tx.inputs[3].tokenCategory == stabilityPoolTokenId, "Invalid receipt, should have correct tokenId");\n\n      // Parse state staking receipt\n      bytes4 epochReceiptBytes, bytes amountStakedReceiptBytes = tx.inputs[3].nftCommitment.split(4);\n      int epochReceipt = int(epochReceiptBytes);\n\n      // Check epoch receipt, should be in the same staking epoch as the stability pool\n      // Convert currentPeriod pool state to epoch (10 periods per epoch)\n      int currentEpoch = int(periodPoolBytes) / 10;\n      require(epochReceipt == currentEpoch);\n\n      // Convert bytes to int for follow up calculations\n      int totalStakedEpoch = int(totalStakedEpochBytes);\n      int remainingStakedEpoch = int(remainingStakedEpochBytes);\n      int amountStakedReceipt = int(amountStakedReceiptBytes);\n      \n      // The StabilityPool itself enforces the same lockingBytecode & tokenCategory\n      // Pool functions need to enforce the nftCommitment & value (and tokenAmount in sidecar)\n      // To update the state of the StabilityPool we need to calculate 2 new state variables\n\n      // Calculate newTotalStakedEpoch state\n      int newTotalStakedEpoch = totalStakedEpoch - amountStakedReceipt;\n\n      // Calculate reducedWithdrawalAmount\n      // This is the actual withdrawal amount for the user receipt after accounting for stake reductions due to liquidations\n      int reducedWithdrawalAmount = amountStakedReceipt * remainingStakedEpoch / totalStakedEpoch;\n\n      // Calculate newRemainingStakedEpoch state\n      // Remaining staked is reduced by the actual amount withdrawn\n      // This is because liquidations are already accounted for in the remainingStakedEpoch state\n      int newRemainingStakedEpoch = remainingStakedEpoch - reducedWithdrawalAmount;\n      \n      // Change state StabilityPool\n      // periodPool remains the same, totalStakedEpoch and remainingStakedEpoch are updated\n      bytes newStateStabilityPool = periodPoolBytes + bytes6(newTotalStakedEpoch) + bytes(newRemainingStakedEpoch);\n      require(tx.outputs[0].nftCommitment == newStateStabilityPool);\n\n      // StabilityPool value restricted in calculation of proRataPoolEarnings (see below)\n\n      // TokenSidecar recreated with reduced tokenAmount\n      int newStabilityPoolSidecarTokenAmount = tx.inputs[1].tokenAmount - reducedWithdrawalAmount;\n      require(tx.outputs[1].tokenAmount == newStabilityPoolSidecarTokenAmount);\n\n      // Recreate functionContract exactly\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\n      require(tx.outputs[2].value == 1000);\n\n      // Output for Withdrawal tokens, at output index 3\n      // Nft commitment check of 0x not strictly necessary, but added for completeness\n      require(tx.outputs[3].tokenCategory == tx.inputs[1].tokenCategory);\n      require(tx.outputs[3].tokenAmount == reducedWithdrawalAmount);\n      require(tx.outputs[3].value == 1000);\n      require(tx.outputs[3].nftCommitment == 0x);\n\n      int currentPoolBchBalance = tx.inputs[0].value;\n      // Subtract dust minimum of 1000 sats to keep minimum balance in the pool\n      int totalPoolEarnings = currentPoolBchBalance - 1000;\n      // Calculate user pro-rata pool earnings on reduced withdrawal amount (after stake reduction)\n      // proRataPoolEarnings = totalPoolEarnings * userShare\n      // with userShare = reducedWithdrawalAmount / remainingStakedEpoch\n      // (equal to amountStakedReceipt / totalStakedEpoch in ideal real-number arithmetic)\n      int proRataPoolEarnings = totalPoolEarnings * reducedWithdrawalAmount / remainingStakedEpoch;\n\n      // Assign index for the bch change output, default at index 4\n      // Output index is updated to 5 if there is a stakeEarningsBch output created\n      int changeBchOutputIndex = 4;\n\n      // Check if there are pool earnings to be distributed\n      // Depending on if there are, we need to restrict the new BCH holdings of the stabilityPool accordingly\n      if(proRataPoolEarnings > 1000){\n        // If the proRataPoolEarnings are > 1000, create a dedicated output and adjust output indexes\n        changeBchOutputIndex = 5;\n\n        // Require earnings output at dynamic output index\n        require(tx.outputs[4].value == proRataPoolEarnings);\n        require(tx.outputs[4].tokenCategory == 0x);\n\n        // Calculate new stabilityPool BCH balance after pro rata pool earnings payout\n        int newStabilityPoolBchBalance = currentPoolBchBalance - proRataPoolEarnings;\n        require(tx.outputs[0].value == newStabilityPoolBchBalance, "Recreate contract at output0 - should have updated BCH Balance after pro rata pool earnings payout");\n      } else {\n        // No pool earnings paid out, stabilityPool BCH balance should remain the same\n        require(tx.outputs[0].value == currentPoolBchBalance, "Recreate contract at output0 - should have same BCH Balance");\n      }\n\n      // Optional output for BCH change at dynamic output index\n      if (tx.outputs.length > changeBchOutputIndex) {\n        require(tx.outputs[changeBchOutputIndex].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");\n      }\n\n      // Don\'t allow more outputs to prevent minting extra NFTs.\n      require(tx.outputs.length <= changeBchOutputIndex + 1, "Invalid number of outputs");\n    }\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce78527e8800cf547f567f53ce547a8853cf547f7c815479815a969d7b817b817b81527978947c527995537a9652797894547a537a56807e7c7e00d28851d0789451d39d52cd52c78852d252cf8852d152ce8852cc02e8039d53d151ce8853d3789d53cc02e8039d53d2008800c67602e803947b957b96547802e803a063755554cc52799d54d10088527952799400cc789d756700cc53799d68c478a06376d1008868c47c8ba17777',
    sourceMap: '42:14:42:35;:38::39;:6::41:1;45:45:45:66:0;:35::81:1;46:24:46:25:0;:14::40:1;:44::64:0;:67::71;:44:::1;:6::73;49:63:49:64:0;:53::79:1;:86::87:0;:53::88:1;50:91:50:92:0;:70::93:1;53:24:53:25:0;:14::40:1;:44::64:0;;:6::114:1;56:75:56:76:0;:65::91:1;:98::99:0;:65::100:1;57:29:57:46:0;:25::47:1;61:29:61:44:0;;:25::45:1;:48::50:0;:25:::1;62:6:62:44;65:33:65:54:0;:29::55:1;66:37:66:62:0;:33::63:1;67:36:67:60:0;:32::61:1;74::74:48:0;;:51::70;:32:::1;78:36:78:55:0;:58::78;;:36:::1;:81::97:0;;:36:::1;83::83:56:0;;:59::82;:36:::1;87::87:51:0;;:61::80;;:54::81:1;;:36;:90::113:0;:36::114:1;88:25:88:26:0;:14::41:1;:6::68;93:57:93:58:0;:47::71:1;:74::97:0;:47:::1;94:25:94:26:0;:14::39:1;:6::79;97:25:97:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;98:25:98:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;99:25:99:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;100:25:100:26:0;:14::33:1;:37::41:0;:6::43:1;104:25:104:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;105:25:105:26:0;:14::39:1;:43::66:0;:6::68:1;106:25:106:26:0;:14::33:1;:37::41:0;:6::43:1;107:25:107:26:0;:14::41:1;:45::47:0;:6::49:1;109:44:109:45:0;:34::52:1;111:30:111:51:0;:54::58;:30:::1;116:52:116:75:0;:32:::1;:78::98:0;:32:::1;120:33:120:34:0;124:9:124:28;:31::35;:9:::1;:36:135:7:0;126:8:126:33:1;;129:27:129:28:0;:16::35:1;:39::58:0;;:8::60:1;130:27:130:28:0;:16::43:1;:47::49:0;:8::51:1;133:41:133:62:0;;:65::84;;:41:::1;134:27:134:28:0;:16::35:1;:39::65:0;:8::169:1;124:36:135:7;135:13:138::0;137:27:137:28;:16::35:1;:39::60:0;;:8::125:1;135:13:138:7;141:10:141:27:0;:30::50;:10:::1;:52:143:7:0;142:27:142:47;:16::62:1;:66::68:0;:8::128:1;141:52:143:7;146:14:146:31:0;:35::55;:::59:1;:6::90;40:4:147:5;',
    logs: [],
    requires: [
      {
        ip: 2,
        line: 42,
      },
      {
        ip: 10,
        line: 46,
      },
      {
        ip: 21,
        line: 53,
        message: 'Invalid receipt, should have correct tokenId',
      },
      {
        ip: 33,
        line: 62,
      },
      {
        ip: 66,
        line: 88,
      },
      {
        ip: 73,
        line: 94,
      },
      {
        ip: 78,
        line: 97,
      },
      {
        ip: 83,
        line: 98,
      },
      {
        ip: 88,
        line: 99,
      },
      {
        ip: 92,
        line: 100,
      },
      {
        ip: 97,
        line: 104,
      },
      {
        ip: 101,
        line: 105,
      },
      {
        ip: 105,
        line: 106,
      },
      {
        ip: 109,
        line: 107,
      },
      {
        ip: 130,
        line: 129,
      },
      {
        ip: 134,
        line: 130,
      },
      {
        ip: 143,
        line: 134,
        message: 'Recreate contract at output0 - should have updated BCH Balance after pro rata pool earnings payout',
      },
      {
        ip: 150,
        line: 137,
        message: 'Recreate contract at output0 - should have same BCH Balance',
      },
      {
        ip: 159,
        line: 142,
        message: 'Invalid BCH change output - should not hold any tokens',
      },
      {
        ip: 165,
        line: 146,
        message: 'Invalid number of outputs',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:39.325Z',
} as const;
