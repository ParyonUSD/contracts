export default {
  contractName: 'payInterest',
  constructorInputs: [
    {
      name: 'stabilityPoolTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'payInterest',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_SWAP OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_SWAP OP_6 OP_SPLIT OP_5 OP_SPLIT OP_SWAP OP_1 OP_SPLIT OP_ROT OP_2 OP_SPLIT OP_4 OP_ROLL OP_BIN2NUM OP_0 OP_NUMEQUALVERIFY OP_3 OP_ROLL OP_BIN2NUM OP_DUP OP_2 OP_LESSTHAN OP_IF OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_1 OP_NUM2BIN OP_4 OP_UTXOTOKENCATEGORY OP_6 OP_ROLL OP_1 OP_CAT OP_EQUALVERIFY OP_4 OP_UTXOTOKENCOMMITMENT OP_DUP OP_BIN2NUM OP_5 OP_ROLL OP_BIN2NUM OP_2DUP OP_GREATERTHAN OP_VERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_9 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_7 OP_ROLL OP_BIN2NUM OP_DUP OP_0 OP_GREATERTHAN OP_VERIFY OP_7 OP_ROLL OP_BIN2NUM OP_SWAP 00e1f505 OP_MUL OP_ROT OP_DIV OP_MUL 80969800 OP_DIV OP_1 OP_UTXOVALUE OP_2SWAP OP_SUB OP_SWAP OP_ROT OP_ROT OP_MUL OP_SUB dc05 OP_SUB OP_3 OP_ROLL OP_2 OP_SPLIT OP_1 OP_UTXOTOKENCOMMITMENT OP_13 OP_SPLIT OP_DROP OP_5 OP_ROLL OP_CAT OP_4 OP_ROLL OP_CAT OP_2 OP_PICK OP_CAT OP_ROT OP_CAT OP_SWAP OP_CAT OP_1 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_1 OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_3 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// PayInterest loan contract function\r\n// Is used by the Collector contract to trigger interest payments on loans\r\n// Calculates how much interest (BCH) loans pays based on the set interest rate (and if needed, the number of elapsed periods)\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x07\r\n*/\r\n\r\n// Note: This function can only be called if there are no ongoing redemptions against the loan and if the loan debt is non-zero\r\n\r\ncontract payInterest(\r\n  bytes32 stabilityPoolTokenId\r\n  ) {\r\n      // function payInterest\r\n      // Calculates how much interest (BCH) user must pay to Collector based on the number of elapsed loan periods.\r\n      // Loan collateral pays for the transaction fees (normally no external fee input required).\r\n      //\r\n      // Inputs: 00-PriceContract, 01-loan, 02-loanTokenSidecar, 03-payInterest, 04-collector, ?05-feeBch\r\n      // Outputs: 00-PriceContract, 01-loan, 02-loanTokenSidecar, 03-payInterest, 04-collector, ?05-changeBch\r\n\r\n    function payInterest(){\r\n      // require function to be at inputIndex 3\r\n      require(this.activeInputIndex == 3);\r\n\r\n      // Authenticate PriceContract at inputIndex 0\r\n      bytes parityTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x00);\r\n\r\n      // Authenticate Loan at inputIndex 1, nftCommitment checked below\r\n      require(tx.inputs[1].tokenCategory == parityTokenId + 0x01);\r\n\r\n      // Parse loan state\r\n      // Splitting up state into bytes7, bytes6, bytes5 and bytes9 which totals bytes27\r\n      bytes loanState = tx.inputs[1].nftCommitment;\r\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\r\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\r\n      require(identifier == 0x01);\r\n      bytes6 amountBeingRedeemed, bytes remainingPartLoanState2 = remainingPartLoanState.split(6);\r\n      bytes5 nextFiveBytesLoanState, bytes lastPartLoanState = remainingPartLoanState2.split(5);\r\n      byte status, bytes4 lastPeriodInterestPaidBytes = nextFiveBytesLoanState.split(1);\r\n      bytes2 currentInterestRate, bytes lastSevenBytesLoanState = lastPartLoanState.split(2);\r\n\r\n      // No ongoing redemptions when paying interest\r\n      // This also prevents loans from switching to their nextInterestRate while being redeemed against\r\n      require(int(amountBeingRedeemed) == 0);\r\n\r\n      // Update the loan status\r\n      int statusInt = int(status);\r\n      if(statusInt < 2) statusInt = statusInt + 1;\r\n      byte newStatus = byte(statusInt);\r\n\r\n      // Authenticate collector\r\n      require(tx.inputs[4].tokenCategory == stabilityPoolTokenId + 0x01);\r\n      bytes currentPeriodPoolBytes = tx.inputs[4].nftCommitment;\r\n      int currentPeriodPool = int(currentPeriodPoolBytes);\r\n      int lastPeriodInterestPaid = int(lastPeriodInterestPaidBytes);\r\n      require(currentPeriodPool > lastPeriodInterestPaid);\r\n\r\n      // Read latest price from PriceContract contract\r\n      bytes4 oraclePriceBytes = tx.inputs[0].nftCommitment.slice(5,9);\r\n      int oraclePrice = int(oraclePriceBytes);\r\n\r\n      // Interest only needs to be paid if the loan debt is non-zero\r\n      int borrowedAmount = int(borrowedAmountBytes);\r\n      require(borrowedAmount > 0);\r\n\r\n      // Calculate newCollateralAmount after interestPayment\r\n      int interestRateLoan = int(currentInterestRate);\r\n      int borrowedValueSats = borrowedAmount * 100_000_000 / oraclePrice;\r\n      // Interest rate is denominated in per 10-million\r\n      int interestPayment = interestRateLoan * borrowedValueSats / 10_000_000;\r\n      int collateral = tx.inputs[1].value;\r\n      // Handle delayed interest payments for previous periods\r\n      int interestPeriods = currentPeriodPool - lastPeriodInterestPaid;\r\n      int newCollateralAmount = collateral - (interestPayment * interestPeriods) - 1500;\r\n\r\n      bytes2 nextInterestRate, bytes interestManagerConfiguration = lastSevenBytesLoanState.split(2);\r\n      // Update status, lastPeriodInterestPaid, current and next interest rate state in loan\r\n      bytes13 fixedPartLoanState = tx.inputs[1].nftCommitment.split(13)[0];\r\n      // Semantic typecast of \'currentPeriodPoolBytes\' to bytes4 so concatenation is type bytes27\r\n      bytes27 newLoanCommitment = fixedPartLoanState + newStatus + bytes4(currentPeriodPoolBytes) + nextInterestRate + nextInterestRate + bytes5(interestManagerConfiguration);\r\n\r\n      // Recreate loan contract with new state at output index 1\r\n      require(tx.outputs[1].nftCommitment == newLoanCommitment, "Recreate loan contract - wrong nftCommitment");\r\n      require(tx.outputs[1].lockingBytecode == tx.inputs[1].lockingBytecode, "Recreate loan contract - invalid lockingBytecode");\r\n      require(tx.outputs[1].tokenCategory == tx.inputs[1].tokenCategory, "Recreate loan contract - invalid tokenCategory");\r\n      require(tx.outputs[1].value == newCollateralAmount, "Recreate loan contract - invalid value");\r\n      require(tx.outputs[1].tokenAmount == 0, "Recreate loan contract - should have zero token amount");\r\n\r\n      // Recreate functionContract at outputIndex3\r\n      require(tx.outputs[3].lockingBytecode == tx.inputs[3].lockingBytecode);\r\n      require(tx.outputs[3].nftCommitment == tx.inputs[3].nftCommitment);\r\n      require(tx.outputs[3].tokenCategory == tx.inputs[3].tokenCategory);\r\n      require(tx.outputs[3].value == 1000);\r\n      require(tx.outputs[3].tokenAmount == 0);\r\n    }\r\n}',
  debug: {
    bytecode: 'c0539dc0ce00ce78517e8800cf517f7501008851ce7c517e8851cf577f7c517f7c51887c567f557f7c517f7b527f547a81009d537a8176529f63768b7768518054ce567a517e8854cf7681557a816ea06900cf597f75557f7781577a817600a069577a817c0400e1f505957b969504809698009651c672947c7b7b959402dc0594537a527f51cf5d7f75557a7e547a7e52797e7b7e7c7e51d28851cd51c78851d151ce8851cc9d51d3009d53cd53c78853d253cf8853d153ce8853cc02e8039d53d3009c',
    sourceMap: '25:14:25:35;:39::40;:6::42:1;28:38:28:59:0;:28::74:1;29:24:29:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;30:24:30:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;33:24:33:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;37:34:37:35:0;:24::50:1;38:80:38:81:0;:64::82:1;39:52:39:70:0;:77::78;:52::79:1;40:14:40:24:0;:28::32;:6::34:1;41:66:41:88:0;:95::96;:66::97:1;42:93:42:94:0;:63::95:1;43:56:43:78:0;:85::86;:56::87:1;44:66:44:83:0;:90::91;:66::92:1;48:18:48:37:0;;:14::38:1;:42::43:0;:6::45:1;51:26:51:32:0;;:22::33:1;52:9:52:18:0;:21::22;:9:::1;:24::50:0;:36::45;:::49:1;:24::50;;53:23:53:38;;56:24:56:25:0;:14::40:1;:44::64:0;;:67::71;:44:::1;:6::73;57:47:57:48:0;:37::63:1;58:34:58:56:0;:30::57:1;59:39:59:66:0;;:35::67:1;60:14:60:56:0;::::1;:6::58;63:42:63:43:0;:32::58:1;:67::68:0;:32::69:1;;:65::66:0;:32::69:1;;64:24:64:45;67:31:67:50:0;;:27::51:1;68:14:68:28:0;:31::32;:14:::1;:6::34;71:33:71:52:0;;:29::53:1;72:30:72:44:0;:47::58;:30:::1;:61::72:0;:30:::1;74:28:74:64;:67::77:0;:28:::1;75:33:75:34:0;:23::41:1;77:28:77:70:0;::::1;78:32:78:42:0;:46::61;:64::79;:46:::1;:32::80;:83::87:0;:32:::1;80:68:80:91:0;;:98::99;:68::100:1;82:45:82:46:0;:35::61:1;:68::70:0;:35::71:1;:::74;84:55:84:64:0;;:34:::1;:74::96:0;;:34::97:1;:100::116:0;;:34:::1;:119::135:0;:34:::1;:145::173:0;:34::174:1;87:25:87:26:0;:14::41:1;:6::112;88:25:88:26:0;:14::43:1;:57::58:0;:47::75:1;:6::129;89:25:89:26:0;:14::41:1;:55::56:0;:45::71:1;:6::123;90:25:90:26:0;:14::33:1;:6::100;91:25:91:26:0;:14::39:1;:43::44:0;:6::104:1;94:25:94:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;95:25:95:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;96:25:96:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;97:25:97:26:0;:14::33:1;:37::41:0;:6::43:1;98:25:98:26:0;:14::39:1;:43::44:0;:6::46:1',
    logs: [],
    requires: [
      {
        ip: 3,
        line: 25,
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
        ip: 34,
        line: 40,
      },
      {
        ip: 50,
        line: 48,
      },
      {
        ip: 70,
        line: 56,
      },
      {
        ip: 80,
        line: 60,
      },
      {
        ip: 96,
        line: 68,
      },
      {
        ip: 143,
        line: 87,
        message: 'Recreate loan contract - wrong nftCommitment',
      },
      {
        ip: 148,
        line: 88,
        message: 'Recreate loan contract - invalid lockingBytecode',
      },
      {
        ip: 153,
        line: 89,
        message: 'Recreate loan contract - invalid tokenCategory',
      },
      {
        ip: 156,
        line: 90,
        message: 'Recreate loan contract - invalid value',
      },
      {
        ip: 160,
        line: 91,
        message: 'Recreate loan contract - should have zero token amount',
      },
      {
        ip: 165,
        line: 94,
      },
      {
        ip: 170,
        line: 95,
      },
      {
        ip: 175,
        line: 96,
      },
      {
        ip: 179,
        line: 97,
      },
      {
        ip: 184,
        line: 98,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:45.126Z',
} as const;
