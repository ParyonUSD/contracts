export default {
  contractName: 'manageLoan',
  constructorInputs: [],
  abi: [
    {
      name: 'manage',
      inputs: [
        {
          name: 'repayAmount',
          type: 'int',
        },
        {
          name: 'interestManagerConfiguration',
          type: 'bytes5',
        },
      ],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_SWAP OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_OVER OP_6 OP_SPLIT OP_DROP OP_SWAP OP_BIN2NUM OP_SWAP OP_BIN2NUM OP_2DUP OP_SUB OP_5 OP_PICK OP_0 OP_NUMEQUAL OP_6 OP_PICK OP_2 OP_PICK OP_NUMEQUAL OP_SWAP OP_7 OP_PICK 1027 OP_GREATERTHANOREQUAL OP_BOOLOR OP_OVER OP_BOOLOR OP_VERIFY OP_6 OP_PICK OP_ROT OP_LESSTHANOREQUAL OP_VERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_9 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_7 OP_PICK OP_SIZE OP_NIP OP_5 OP_NUMEQUALVERIFY OP_1 OP_ROT OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_BOOLAND OP_DUP OP_NOTIF OP_3 OP_ROT OP_DROP OP_SWAP OP_4 OP_PICK OP_8 OP_PICK OP_SUB OP_DUP 1027 OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_DUP OP_10 OP_MUL OP_11 OP_DIV OP_DUP OP_6 OP_PICK OP_MUL 00e1f505 OP_DIV OP_3 OP_PICK OP_OVER OP_LESSTHANOREQUAL OP_VERIFY OP_7 OP_PICK OP_0 OP_GREATERTHAN OP_IF OP_1 OP_UTXOVALUE OP_3 OP_PICK OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ENDIF OP_9 OP_PICK OP_15 OP_SPLIT OP_DROP OP_1 OP_5 OP_PICK OP_6 OP_NUM2BIN OP_CAT OP_OVER OP_CAT OP_14 OP_PICK OP_CAT OP_1 OP_OUTPUTBYTECODE OP_1 OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTBYTECODE OP_4 OP_UTXOBYTECODE OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCOMMITMENT OP_4 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_4 OP_OUTPUTVALUE OP_4 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_ENDIF OP_OVER OP_OUTPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_EQUALVERIFY OP_OVER OP_OUTPUTTOKENCOMMITMENT OP_3 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_OVER OP_OUTPUTTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_OVER OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_SWAP OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_6 OP_PICK OP_0 OP_GREATERTHAN OP_IF OP_5 OP_OVER OP_IF OP_DROP OP_2 OP_ENDIF OP_DUP OP_OUTPUTTOKENCATEGORY OP_7 OP_PICK OP_EQUALVERIFY OP_DUP OP_OUTPUTTOKENAMOUNT OP_8 OP_PICK OP_NUMEQUALVERIFY OP_DUP OP_OUTPUTBYTECODE 6a OP_0 OP_SIZE OP_SWAP OP_CAT OP_CAT OP_EQUALVERIFY OP_DROP OP_ENDIF OP_IF OP_3 OP_OUTPUTTOKENCATEGORY OP_5 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_OUTPUTBYTECODE 6a OP_0 OP_SIZE OP_SWAP OP_CAT OP_CAT OP_EQUALVERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1',
  source: 'pragma cashscript ^0.12.0;\n\n// Manage loan contract function\n// Is used to repay debt, add collateral, remove collateral, and change the loan\'s interestManagerConfiguration\n\n/*  --- State Immutable NFT ---\n    byte identifier == 0x02\n*/\n\n// for partial repayments:\n// minimumDebt = 100.00 ParyonUSD\n// minimumRepay = 100.00 ParyonUSD\n\n// Note: This function can only withdraw collateral if there are no ongoing redemptions against the loan\n\ncontract manageLoan(\n  ) {\n      // function manage\n      // Allows loankey holder to repay tokens, add collateral, remove collateral, and change the interestManagerConfiguration.\n      //\n      // Inputs: 00-pricecontract, 01-loan, 02-loanTokenSidecar, 03-manageLoan, 04-loanKey, 05-userBch, ?06-repayTokens\n      // Outputs: 00-pricecontract, 01-loan, 02-loanTokenSidecar, 03-manageLoan, 04-loanKey, ?05-opreturn, ??-changeTokens, ??-changeBch\n      //      or: 00-pricecontract, 01-manageLoan, 02-opreturn, 03-opreturn, ??-changeTokens, ??-changeBch\n\n    function manage(\n      int repayAmount,\n      // Note: the bytes length of function arguments are not automatically enforced\n      bytes5 interestManagerConfiguration\n    ){\n      // Require function to be at inputIndex 3\n      require(this.activeInputIndex == 3);\n\n      // Authenticate PriceContract at inputIndex 0\n      bytes paryonTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\n      require(tx.inputs[0].tokenCategory == paryonTokenId + 0x01);\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x00);\n\n      // Authenticate Loan at inputIndex 1, nftCommitment checked later\n      require(tx.inputs[1].tokenCategory == paryonTokenId + 0x01);\n\n      // Check loanTokenId from tokensidecar at inputIndex2\n      bytes loanTokenId = tx.inputs[2].tokenCategory;\n\n      // Check loanTokenId provided at inputIndex4 to be the loanKey\n      require(tx.inputs[4].tokenCategory == loanTokenId + 0x02);\n\n      // Parse loan state\n      bytes loanState = tx.inputs[1].nftCommitment;\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\n      require(identifier == 0x01);\n      bytes6 amountBeingRedeemedBytes = remainingPartLoanState.split(6)[0];\n\n      // Convert bytes to int for follow-up calculations\n      int borrowedAmount = int(borrowedAmountBytes);\n      int amountBeingRedeemed = int(amountBeingRedeemedBytes);\n\n      // Calculate redeemableDebt because only the debt not being redeemed against can be repaid\n      int redeemableDebt = borrowedAmount - amountBeingRedeemed;\n      \n      // Create noRepayment and isFullRepayment booleans\n      bool noRepayment = repayAmount == 0;\n      bool isFullRepaymentOfRedeemableDebt = repayAmount == redeemableDebt;\n\n      // Check repayAmount is either zero, the minimum threshold OR full isFullRepayment (if less than minimum)\n      require(noRepayment || repayAmount >= 100_00 || isFullRepaymentOfRedeemableDebt, "RepayAmount loan needs to be in valid range");\n      \n      // RepayAmount should not exceed redeemableDebt\n      require(repayAmount <= redeemableDebt);\n\n      // Read latest price from PriceContract contract\n      bytes4 oraclePriceBytes = tx.inputs[0].nftCommitment.slice(5,9);\n      int oraclePrice = int(oraclePriceBytes);\n\n      // Validate input interestManagerConfiguration\n      require(interestManagerConfiguration.length == 5);\n\n      // Assign index for the function nft output\n      int functionNftOutputIndex = 1;\n\n      // Loan can only be closed on full repayment AND no pending redemptions\n      bool closeLoan = isFullRepaymentOfRedeemableDebt && amountBeingRedeemed == 0;\n\n      // Check whether to recreate the loan contract\n      if(!closeLoan){\n        // If the loan is not closed, the loan contract has to be recreated at output index 1\n        // The ManageLoan function contract is then re-created at output index 3\n        functionNftOutputIndex = 3;\n\n        // Check newBorrowAmount is greater than minimumDebt\n        int newBorrowAmount = borrowedAmount - repayAmount;\n        require(newBorrowAmount >= 100_00, "Invalid newBorrowAmount, needs to be greater than minimumDebt");\n\n        // Calculate minimum collateral\n        int newCollateral = tx.outputs[1].value;\n        // Collateral has to be 10% greater than maxBorrowBase\n        int maxBorrowBase = ((newCollateral * 10) / 11);\n        int maxBorrow = maxBorrowBase * oraclePrice / 100_000_000;\n        require(newBorrowAmount <= maxBorrow, "Invalid newBorrowAmount, collateral ratio would get too low");\n\n        // If redemptions are ongoing, collateral cannot be withdrawn\n        if(amountBeingRedeemed > 0){\n          int collateral = tx.inputs[1].value;\n          require(newCollateral >= collateral, "Cannot withdraw collateral during redemptions");\n        }\n\n        // Update BorrowAmount & interestManagerConfiguration\n        bytes15 fixedPartLoanState = remainingPartLoanState.split(15)[0];\n        bytes27 newLoanCommitment = 0x01 + bytes6(newBorrowAmount) + fixedPartLoanState + interestManagerConfiguration;\n        \n        // Recreate loan contract with new state\n        require(tx.outputs[1].lockingBytecode == tx.inputs[1].lockingBytecode, "Recreate loan contract - invalid lockingBytecode");\n        require(tx.outputs[1].tokenCategory == tx.inputs[1].tokenCategory, "Recreate loan contract - invalid tokenCategory");\n        require(tx.outputs[1].nftCommitment == newLoanCommitment, "Invalid state loan contract - wrong nftCommitment");\n        require(tx.outputs[1].tokenAmount == 0, "Recreate loan contract - should have zero token amount");\n\n        // Recreate loanKey to user\n        require(tx.outputs[4].lockingBytecode == tx.inputs[4].lockingBytecode, "Recreate loanKey - invalid lockingBytecode");\n        require(tx.outputs[4].tokenCategory == tx.inputs[4].tokenCategory, "Recreate loanKey - invalid tokenCategory");\n        require(tx.outputs[4].nftCommitment == tx.inputs[4].nftCommitment, "Recreate loanKey - invalid nftCommitment");\n        require(tx.outputs[4].value == tx.inputs[4].value, "Recreate loanKey - invalid value");\n      }\n\n      // Recreate ManageLoan functionContract at output at index 1 or 3\n      require(tx.outputs[functionNftOutputIndex].lockingBytecode == tx.inputs[3].lockingBytecode);\n      require(tx.outputs[functionNftOutputIndex].nftCommitment == tx.inputs[3].nftCommitment);\n      require(tx.outputs[functionNftOutputIndex].tokenCategory == tx.inputs[3].tokenCategory);\n      require(tx.outputs[functionNftOutputIndex].value == 1000);\n      require(tx.outputs[functionNftOutputIndex].tokenAmount == 0);\n\n      if(repayAmount > 0){\n        // Burn repaid ParyonUSD by sending to unspendable opreturn output at index 5\n        int opreturnOutputIndex = 5;\n        // If the loan is closed, the opreturn output is at index 2\n        if(closeLoan) opreturnOutputIndex = 2;\n        require(tx.outputs[opreturnOutputIndex].tokenCategory == paryonTokenId);\n        require(tx.outputs[opreturnOutputIndex].tokenAmount == repayAmount);\n        require(tx.outputs[opreturnOutputIndex].lockingBytecode == new LockingBytecodeNullData([0x]));\n      }\n\n      if(closeLoan){\n        // Burn mutable Loan NFT by sending to unspendable opreturn output at index 3\n        // This guarantees the mutable NFT can not occur on any user controlled output\n        require(tx.outputs[3].tokenCategory == paryonTokenId + 0x01);\n        require(tx.outputs[3].lockingBytecode == new LockingBytecodeNullData([0x]));\n      }\n    }\n}',
  debug: {
    bytecode: 'c0539dc0ce00ce78517e8800cf517f7501008851ce78517e8852ce54ce7c527e8851cf577f7c517f7c518878567f757c817c816e945579009c567952799c7c5779021027a29b789b6956797ba16900cf597f75557f778157798277559d517b5379009c9a7664537b757c547958799476021027a26951cc765a955b96765679950400e1f50596537978a169577900a06351c6537978a269756859795f7f7551557956807e787e5e797e51cd51c78851d151ce8851d2788851d3009d54cd54c78854d154ce8854d254cf8854cc54c69d6d6d6d6878cd53c78878d253cf8878d153ce8878cc02e8039d7cd3009d567900a06355786375526876d157798876d358799d76cd016a00827c7e7e8875686353d15579517e8853cd016a00827c7e7e88686d6d6d7551',
    sourceMap: '31:14:31:35;:39::40;:6::42:1;34:38:34:59:0;:28::74:1;35:24:35:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;36:24:36:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;39:24:39:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;42:36:42:37:0;:26::52:1;45:24:45:25:0;:14::40:1;:44::55:0;:58::62;:44:::1;:6::64;48:34:48:35:0;:24::50:1;49:80:49:81:0;:64::82:1;50:52:50:70:0;:77::78;:52::79:1;51:14:51:24:0;:28::32;:6::34:1;52:40:52:62:0;:69::70;:40::71:1;:::74;55:31:55:50:0;:27::51:1;56:36:56:60:0;:32::61:1;59:27:59:63:0;::::1;62:25:62:36:0;;:40::41;:25:::1;63:45:63:56:0;;:60::74;;:45:::1;66:14:66:25:0;:29::40;;:44::50;:29:::1;:14;:54::85:0;:14:::1;:6::134;69:14:69:25:0;;:29::43;:14:::1;:6::45;72:42:72:43:0;:32::58:1;:67::68:0;:32::69:1;;:65::66:0;:32::69:1;;73:24:73:45;76:14:76:42:0;;:::49:1;;:53::54:0;:6::56:1;79:35:79:36:0;82:23:82:54;:58::77;;:81::82;:58:::1;:23;85:10:85:19:0;:9:122:7;88:33:88:34;:8::35:1;;;91:30:91:44:0;;:47::58;;:30:::1;92:16:92:31:0;:35::41;:16:::1;:8::108;95:39:95:40:0;:28::47:1;97:30:97:43:0;:46::48;:30:::1;:52::54:0;:29:::1;98:24:98:37:0;:40::51;;:24:::1;:54::65:0;:24:::1;99:16:99:31:0;;:35::44;:16:::1;:8::109;102:11:102:30:0;;:33::34;:11:::1;:35:105:9:0;103:37:103:38;:27::45:1;104:18:104:31:0;;:35::45;:18:::1;:10::96;102:35:105:9;;108:37:108:59:0;;:66::68;:37::69:1;:::72;109:36:109:40:0;:50::65;;:43::66:1;;:36;:69::87:0;:36:::1;:90::118:0;;:36:::1;112:27:112:28:0;:16::45:1;:59::60:0;:49::77:1;:8::131;113:27:113:28:0;:16::43:1;:57::58:0;:47::73:1;:8::125;114:27:114:28:0;:16::43:1;:47::64:0;:8::119:1;115:27:115:28:0;:16::41:1;:45::46:0;:8::106:1;118:27:118:28:0;:16::45:1;:59::60:0;:49::77:1;:8::125;119:27:119:28:0;:16::43:1;:57::58:0;:47::73:1;:8::119;120:27:120:28:0;:16::43:1;:57::58:0;:47::73:1;:8::119;121:27:121:28:0;:16::35:1;:49::50:0;:39::57:1;:8::95;85:20:122:7;;;;125:25:125:47:0;:14::64:1;:78::79:0;:68::96:1;:6::98;126:25:126:47:0;:14::62:1;:76::77:0;:66::92:1;:6::94;127:25:127:47:0;:14::62:1;:76::77:0;:66::92:1;:6::94;128:25:128:47:0;:14::54:1;:58::62:0;:6::64:1;129:25:129:47:0;:14::60:1;:64::65:0;:6::67:1;131:9:131:20:0;;:23::24;:9:::1;:25:139:7:0;133:34:133:35;135:11:135:20;:22::46;::::1;;;136:27:136::0;:16::61:1;:65::78:0;;:8::80:1;137:27:137:46:0;:16::59:1;:63::74:0;;:8::76:1;138:27:138:46:0;:16::63:1;:67::100:0;:96::98;::::1;;;;:8::102;131:25:139:7;;141:19:146::0;144:27:144:28;:16::43:1;:47::60:0;;:63::67;:47:::1;:8::69;145:27:145:28:0;:16::45:1;:49::82:0;:78::80;::::1;;;;:8::84;141:19:146:7;25:4:147:5;;;;',
    logs: [],
    requires: [
      {
        ip: 2,
        line: 31,
      },
      {
        ip: 10,
        line: 35,
      },
      {
        ip: 17,
        line: 36,
      },
      {
        ip: 23,
        line: 39,
      },
      {
        ip: 31,
        line: 45,
      },
      {
        ip: 41,
        line: 51,
      },
      {
        ip: 69,
        line: 66,
        message: 'RepayAmount loan needs to be in valid range',
      },
      {
        ip: 74,
        line: 69,
      },
      {
        ip: 89,
        line: 76,
      },
      {
        ip: 111,
        line: 92,
        message: 'Invalid newBorrowAmount, needs to be greater than minimumDebt',
      },
      {
        ip: 129,
        line: 99,
        message: 'Invalid newBorrowAmount, collateral ratio would get too low',
      },
      {
        ip: 141,
        line: 104,
        message: 'Cannot withdraw collateral during redemptions',
      },
      {
        ip: 164,
        line: 112,
        message: 'Recreate loan contract - invalid lockingBytecode',
      },
      {
        ip: 169,
        line: 113,
        message: 'Recreate loan contract - invalid tokenCategory',
      },
      {
        ip: 173,
        line: 114,
        message: 'Invalid state loan contract - wrong nftCommitment',
      },
      {
        ip: 177,
        line: 115,
        message: 'Recreate loan contract - should have zero token amount',
      },
      {
        ip: 182,
        line: 118,
        message: 'Recreate loanKey - invalid lockingBytecode',
      },
      {
        ip: 187,
        line: 119,
        message: 'Recreate loanKey - invalid tokenCategory',
      },
      {
        ip: 192,
        line: 120,
        message: 'Recreate loanKey - invalid nftCommitment',
      },
      {
        ip: 197,
        line: 121,
        message: 'Recreate loanKey - invalid value',
      },
      {
        ip: 206,
        line: 125,
      },
      {
        ip: 211,
        line: 126,
      },
      {
        ip: 216,
        line: 127,
      },
      {
        ip: 220,
        line: 128,
      },
      {
        ip: 224,
        line: 129,
      },
      {
        ip: 240,
        line: 136,
      },
      {
        ip: 245,
        line: 137,
      },
      {
        ip: 254,
        line: 138,
      },
      {
        ip: 264,
        line: 144,
      },
      {
        ip: 273,
        line: 145,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:24.962Z',
} as const;
