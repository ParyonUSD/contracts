export default {
  contractName: 'changeInterest',
  constructorInputs: [],
  abi: [
    {
      name: 'changeInterest',
      inputs: [
        {
          name: 'nextInterestRate',
          type: 'bytes2',
        },
      ],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_DUP OP_SIZE OP_NIP OP_2 OP_NUMEQUALVERIFY OP_DUP OP_BIN2NUM OP_DUP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_DUP 16 OP_SPLIT OP_NIP OP_DUP OP_1 OP_SPLIT OP_1 OP_UTXOTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_OVER OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUAL OP_3 OP_UTXOTOKENCOMMITMENT OP_3 OP_PICK OP_EQUAL OP_3 OP_ROLL 00 OP_EQUAL OP_NOT OP_BOOLAND OP_SWAP OP_OVER OP_BOOLOR OP_VERIFY OP_IF OP_DUP OP_2 OP_SPLIT OP_OVER OP_BIN2NUM OP_6 OP_PICK OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_OVER OP_BIN2NUM OP_7 OP_PICK OP_OVER OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_ENDIF OP_ROT 14 OP_SPLIT OP_DROP OP_4 OP_ROLL OP_CAT OP_ROT OP_CAT OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_3 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE OP_3 OP_UTXOVALUE OP_NUMEQUAL OP_NIP OP_NIP',
  source: 'pragma cashscript ^0.12.0;\n\n// ChangeInterest loan contract function\n// Is used to update the next period interest rate of a loan\n// Can be used by the loan owner (without restrictions) or by the loan\'s interest manager (within predefined min/max range)\n\n/*  --- State Immutable NFT ---\n    byte identifier == 0x08\n*/\n\ncontract changeInterest(\n  ) {\n      // function changeInterest\n      // Allows loan owner or the loan\'s interest manager to change the loans next period interest rate\n      //\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-changeInterest, 03-loanKey-or-loanManagementToken, 04-feeBch\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-changeInterest, 03-loanKey-or-loanManagementToken, ?04-changeBch\n\n    function changeInterest(\n      // Note: the bytes length of function arguments are not automatically enforced\n      bytes2 nextInterestRate\n    ){\n      // Require function to be at inputIndex 2\n      require(this.activeInputIndex == 2);\n\n      // Validate input nextInterestRate\n      require(nextInterestRate.length == 2);\n      // Check nextInterestRate is non-negative\n      int nextInterestRateInt = int(nextInterestRate);\n      require(nextInterestRateInt >= 0);\n\n      // Authenticate Loan at inputIndex 0, nftCommitment checked below\n      bytes paryonTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\n      require(tx.inputs[0].tokenCategory == paryonTokenId + 0x01);\n\n      // Parse loan state\n      bytes loanState = tx.inputs[0].nftCommitment;\n      byte identifier = loanState.split(1)[0];\n      require(identifier == 0x01);\n      bytes interestManagerConfiguration = loanState.split(22)[1];\n      byte interestManager, bytes minMaxRates = interestManagerConfiguration.split(1);\n\n      // Read loanTokenId from tokensidecar at inputIndex1\n      bytes loanTokenId = tx.inputs[1].tokenCategory;\n\n      // Check tokenKey provided at inputIndex3 matches loanTokenId\n      require(tx.inputs[3].tokenCategory.split(32)[0] == loanTokenId);\n      // Check if tokenKey matches loan owner or loan manager\n      // Enforce that there cannot be a manager using 0x00 as commitment (this indicates no manager)\n      bool isLoanOwner = tx.inputs[3].tokenCategory == loanTokenId + 0x02;\n      bool isLoanManager = tx.inputs[3].nftCommitment == interestManager && interestManager != 0x00;\n      require(isLoanOwner || isLoanManager);\n\n      // Check if loan manager provided rate is within authorized range\n      if(isLoanManager){\n        bytes2 minRateManagerBytes, bytes maxRateManagerBytes = minMaxRates.split(2);\n        int minRateManager = int(minRateManagerBytes);\n        require(nextInterestRateInt >= minRateManager , "Next interest rate out of range for manager - below minimum");\n        int maxRateManager = int(maxRateManagerBytes);\n        require(nextInterestRateInt <= maxRateManager, "Next interest rate out of range for manager - exceeds maximum");\n      }\n\n      // Update nextInterestRate\n      bytes20 fixedPartLoanState = loanState.split(20)[0];\n      bytes27 newLoanCommitment = fixedPartLoanState + nextInterestRate + bytes5(interestManagerConfiguration);\n\n      // Recreate loan contract with new state and at least same collateral\n      require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate loan contract - invalid lockingBytecode");\n      require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate loan contract - invalid tokenCategory");\n      require(tx.outputs[0].nftCommitment == newLoanCommitment, "Invalid state loan contract - wrong nftCommitment");\n      require(tx.outputs[0].value >= tx.inputs[0].value, "Recreate loan contract with same or higher BCH amount");\n      require(tx.outputs[0].tokenAmount == 0, "Recreate loan contract - should have zero token amount");\n\n      // Recreate functionContract\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\n      require(tx.outputs[2].value == 1000);\n      require(tx.outputs[2].tokenAmount == 0);\n\n      // Recreate loanKey or loanManagementToken to user\n      require(tx.outputs[3].lockingBytecode == tx.inputs[3].lockingBytecode, "Recreate loanKey or loanManagementToken - invalid lockingBytecode");\n      require(tx.outputs[3].tokenCategory == tx.inputs[3].tokenCategory, "Recreate loanKey or loanManagementToken - invalid tokenCategory");\n      require(tx.outputs[3].nftCommitment == tx.inputs[3].nftCommitment, "Recreate loanKey or loanManagementToken - invalid nftCommitment");\n      require(tx.outputs[3].value == tx.inputs[3].value, "Recreate loanKey or loanManagementToken - invalid value");\n    }\n}',
  debug: {
    bytecode: 'c0529d768277529d76817600a269c0ce00ce7c517e8800cf76517f7551887601167f7776517f51ce53ce01207f75788853ce7c527e8753cf537987537a010087919a7c789b696376527f7881567978a2697881577978a1696d6d687b01147f75547a7e7b7e00cd00c78800d100ce8800d28800cc00c6a26900d3009d52cd52c78852d252cf8852d152ce8852cc02e8039d52d3009d53cd53c78853d153ce8853d253cf8853cc53c69c7777',
    sourceMap: '24:14:24:35;:39::40;:6::42:1;27:14:27:30:0;:::37:1;;:41::42:0;:6::44:1;29:36:29:52:0;:32::53:1;30:14:30:33:0;:37::38;:14:::1;:6::40;33:38:33:59:0;:28::74:1;34:24:34:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;37:34:37:35:0;:24::50:1;38::38:33:0;:40::41;:24::42:1;:::45;39:28:39:32:0;:6::34:1;40:43:40:52:0;:59::61;:43::62:1;:::65;41:48:41:76:0;:83::84;:48::85:1;44:36:44:37:0;:26::52:1;47:24:47:25:0;:14::40:1;:47::49:0;:14::50:1;:::53;:57::68:0;:6::70:1;50:35:50:36:0;:25::51:1;:55::66:0;:69::73;:55:::1;:25;51:37:51:38:0;:27::53:1;:57::72:0;;:27:::1;:76::91:0;;:95::99;:76:::1;;:27;52:14:52:25:0;:29::42;:14:::1;:6::44;55:23:61:7:0;56:64:56:75;:82::83;:64::84:1;57:33:57:52:0;:29::53:1;58:16:58:35:0;;:39::53;:16:::1;:8::119;59:33:59:52:0;:29::53:1;60:16:60:35:0;;:39::53;:16:::1;:8::120;55:23:61:7;;;64:35:64:44:0;:51::53;:35::54:1;:::57;65:55:65:71:0;;:34:::1;:81::109:0;:34::110:1;68:25:68:26:0;:14::43:1;:57::58:0;:47::75:1;:6::129;69:25:69:26:0;:14::41:1;:55::56:0;:45::71:1;:6::123;70:25:70:26:0;:14::41:1;:6::117;71:25:71:26:0;:14::33:1;:47::48:0;:37::55:1;:14;:6::114;72:25:72:26:0;:14::39:1;:43::44:0;:6::104:1;75:25:75:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;76:25:76:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;77:25:77:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;78:25:78:26:0;:14::33:1;:37::41:0;:6::43:1;79:25:79:26:0;:14::39:1;:43::44:0;:6::46:1;82:25:82:26:0;:14::43:1;:57::58:0;:47::75:1;:6::146;83:25:83:26:0;:14::41:1;:55::56:0;:45::71:1;:6::140;84:25:84:26:0;:14::41:1;:55::56:0;:45::71:1;:6::140;85:25:85:26:0;:14::33:1;:47::48:0;:37::55:1;:6::116;19:4:86:5;',
    logs: [],
    requires: [
      {
        ip: 2,
        line: 24,
      },
      {
        ip: 7,
        line: 27,
      },
      {
        ip: 13,
        line: 30,
      },
      {
        ip: 21,
        line: 34,
      },
      {
        ip: 29,
        line: 39,
      },
      {
        ip: 45,
        line: 47,
      },
      {
        ip: 66,
        line: 52,
      },
      {
        ip: 77,
        line: 58,
        message: 'Next interest rate out of range for manager - below minimum',
      },
      {
        ip: 84,
        line: 60,
        message: 'Next interest rate out of range for manager - exceeds maximum',
      },
      {
        ip: 101,
        line: 68,
        message: 'Recreate loan contract - invalid lockingBytecode',
      },
      {
        ip: 106,
        line: 69,
        message: 'Recreate loan contract - invalid tokenCategory',
      },
      {
        ip: 109,
        line: 70,
        message: 'Invalid state loan contract - wrong nftCommitment',
      },
      {
        ip: 115,
        line: 71,
        message: 'Recreate loan contract with same or higher BCH amount',
      },
      {
        ip: 119,
        line: 72,
        message: 'Recreate loan contract - should have zero token amount',
      },
      {
        ip: 124,
        line: 75,
      },
      {
        ip: 129,
        line: 76,
      },
      {
        ip: 134,
        line: 77,
      },
      {
        ip: 138,
        line: 78,
      },
      {
        ip: 142,
        line: 79,
      },
      {
        ip: 147,
        line: 82,
        message: 'Recreate loanKey or loanManagementToken - invalid lockingBytecode',
      },
      {
        ip: 152,
        line: 83,
        message: 'Recreate loanKey or loanManagementToken - invalid tokenCategory',
      },
      {
        ip: 157,
        line: 84,
        message: 'Recreate loanKey or loanManagementToken - invalid nftCommitment',
      },
      {
        ip: 163,
        line: 85,
        message: 'Recreate loanKey or loanManagementToken - invalid value',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:32.242Z',
} as const;
