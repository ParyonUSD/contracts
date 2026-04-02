export default {
  contractName: 'startRedemption',
  constructorInputs: [
    {
      name: 'redeemerTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'startRedemption',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_4 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_OVER OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_SWAP OP_6 OP_SPLIT OP_ROT OP_BIN2NUM OP_ROT OP_BIN2NUM OP_2DUP OP_SUB OP_5 OP_OUTPUTTOKENCOMMITMENT 20 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_ROT OP_NUMEQUAL OP_OVER 1027 OP_GREATERTHANOREQUAL OP_SWAP OP_BOOLOR OP_VERIFY OP_ADD OP_DUP OP_ROT OP_LESSTHANOREQUAL OP_VERIFY OP_ROT OP_SWAP OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_1 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_1 OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_1 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_3 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\n\n// StartRedemption loan contract function\n// Is used by a redemption to start the redemption process, attempting to redeem ParyonUSD tokens for BCH collateral from loan\n\n/*  --- State Immutable NFT ---\n    byte identifier == 0x04\n*/\n\n// for partial redemptions:\n// minimumRedeemAmount = 100.00 ParyonUSD\n\n// Note: startRedemption can be performed against loans with any status (newLoan, single period, mature loan)\n// Secondly, the minimumLoanDebtForSwapOut of 100.00 ParyonUSD means that any loan with debt below this minimum\n// can always be redeemed even if it is not the lowest interest loan. This is to clean up tiny loans.\n// Loan debt below the minimum of 100.00 ParyonUSD can happen if a redemption repays just short of the full loan debt\n\ncontract startRedemption(\n  bytes32 redeemerTokenId\n  ) {\n      // function startRedemption\n      // Redemption started against loan, update loan state to reflect the ongoing amount being redeemed\n      //\n      // Inputs: 00-PriceContract, 01-Loan, 02-loanTokenSidecar, 03-startRedemption, 04-redeemer, 05-Paryon-tokens, 06-feeBch\n      // Outputs: 00-PriceContract, 01-Loan, 02-loanTokenSidecar, 03-startRedemption, 04-redeemer, 05-redemption, 06-redemptionStateSidecar, 07-redemptionTokenSidecar, ??-changeTokens, ??-changeBch\n\n    function startRedemption(){\n      // Require startRedemption function to be at inputIndex 3\n      require(this.activeInputIndex == 3);\n      bytes paryonTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\n\n      // Authenticate PriceContract at inputIndex 0\n      require(tx.inputs[0].tokenCategory == paryonTokenId + 0x01);\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x00);\n\n      // Authenticate Loan at inputIndex 1, nftCommitment checked later\n      require(tx.inputs[1].tokenCategory == paryonTokenId + 0x01);\n\n      // Authenticate redeemer at inputIndex 4\n      require(tx.inputs[4].tokenCategory == redeemerTokenId + 0x02);\n\n      // Parse loan state\n      bytes loanCommitment = tx.inputs[1].nftCommitment;\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanCommitment.split(7);\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\n      require(identifier == 0x01);\n      bytes6 amountBeingRedeemedBytes, bytes lastPartLoanState = remainingPartLoanState.split(6);\n\n      // Calculate redeemableDebt available for new redemption\n      int borrowedAmount = int(borrowedAmountBytes);\n      int amountBeingRedeemed = int(amountBeingRedeemedBytes);\n      int redeemableDebt = borrowedAmount - amountBeingRedeemed;\n      \n      // Read redemptionAmount from redemption state (not from loan state)\n      bytes redemptionAmountBytes = tx.outputs[5].nftCommitment.split(32)[1];\n      int redemptionAmount = int(redemptionAmountBytes);\n\n      // Check range redemptionAmount: minimum threshold OR full isFullRedemption (if less than minimum)\n      bool isFullRedemption = redemptionAmount == redeemableDebt;\n      require(redemptionAmount >= 100_00 || isFullRedemption, "redemptionAmount loan needs to be in valid range");\n      // Calculate and check newAmountBeingRedeemed\n      int newAmountBeingRedeemed = amountBeingRedeemed + redemptionAmount;\n      require(newAmountBeingRedeemed <= borrowedAmount);\n\n      // Construct new loan state\n      bytes27 newLoanCommitment = firstPartLoanState + bytes6(newAmountBeingRedeemed) + bytes14(lastPartLoanState);\n\n      // Recreate loan contract at output index 1\n      require(tx.outputs[1].nftCommitment == newLoanCommitment, "Invalid state loan contract - wrong nftCommitment");\n      require(tx.outputs[1].lockingBytecode == tx.inputs[1].lockingBytecode, "Recreate loan contract - invalid lockingBytecode");\n      require(tx.outputs[1].value == tx.inputs[1].value, "Recreate loan contract with same BCH amount");\n      require(tx.outputs[1].tokenCategory == tx.inputs[1].tokenCategory, "Recreate loan contract - invalid tokenCategory");\n      require(tx.outputs[1].tokenAmount == 0, "Recreate loan contract - should have zero token amount");\n\n      // Recreate startRedemption functionContract at output index 3\n      require(tx.outputs[3].lockingBytecode == tx.inputs[3].lockingBytecode);\n      require(tx.outputs[3].nftCommitment == tx.inputs[3].nftCommitment);\n      require(tx.outputs[3].tokenCategory == tx.inputs[3].tokenCategory);\n      require(tx.outputs[3].value == 1000);\n      require(tx.outputs[3].tokenAmount == 0);\n    }\n}',
  debug: {
    bytecode: 'c0539dc0ce00ce78517e8800cf517f7501008851ce7c517e8854ce7c527e8851cf577f78517f7c51887c567f7b817b816e9455d201207f7781767b9c78021027a27c9b6993767ba1697b7c56807e7c7e51d28851cd51c78851cc51c69d51d151ce8851d3009d53cd53c78853d253cf8853d153ce8853cc02e8039d53d3009c',
    sourceMap: '29:14:29:35;:39::40;:6::42:1;30:38:30:59:0;:28::74:1;33:24:33:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;34:24:34:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;37:24:37:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;40:24:40:25:0;:14::40:1;:44::59:0;:62::66;:44:::1;:6::68;43:39:43:40:0;:29::55:1;44:85:44:86:0;:64::87:1;45:52:45:70:0;:77::78;:52::79:1;46:14:46:24:0;:28::32;:6::34:1;47:65:47:87:0;:94::95;:65::96:1;50:31:50:50:0;:27::51:1;51:36:51:60:0;:32::61:1;52:27:52:63:0;::::1;55:47:55:48:0;:36::63:1;:70::72:0;:36::73:1;:::76;56:29:56:55;59:30:59:46:0;:50::64;:30:::1;60:14:60:30:0;:34::40;:14:::1;:44::60:0;:14:::1;:6::114;62:35:62:73;63:14:63:36:0;:40::54;:14:::1;:6::56;66:34:66:52:0;:62::84;:55::85:1;;:34;:96::113:0;:34::114:1;69:25:69:26:0;:14::41:1;:6::117;70:25:70:26:0;:14::43:1;:57::58:0;:47::75:1;:6::129;71:25:71:26:0;:14::33:1;:47::48:0;:37::55:1;:6::104;72:25:72:26:0;:14::41:1;:55::56:0;:45::71:1;:6::123;73:25:73:26:0;:14::39:1;:43::44:0;:6::104:1;76:25:76:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;77:25:77:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;78:25:78:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;79:25:79:26:0;:14::33:1;:37::41:0;:6::43:1;80:25:80:26:0;:14::39:1;:43::44:0;:6::46:1',
    logs: [],
    requires: [
      {
        ip: 3,
        line: 29,
      },
      {
        ip: 11,
        line: 33,
      },
      {
        ip: 18,
        line: 34,
      },
      {
        ip: 24,
        line: 37,
      },
      {
        ip: 30,
        line: 40,
      },
      {
        ip: 40,
        line: 46,
      },
      {
        ip: 64,
        line: 60,
        message: 'redemptionAmount loan needs to be in valid range',
      },
      {
        ip: 69,
        line: 63,
      },
      {
        ip: 79,
        line: 69,
        message: 'Invalid state loan contract - wrong nftCommitment',
      },
      {
        ip: 84,
        line: 70,
        message: 'Recreate loan contract - invalid lockingBytecode',
      },
      {
        ip: 89,
        line: 71,
        message: 'Recreate loan contract with same BCH amount',
      },
      {
        ip: 94,
        line: 72,
        message: 'Recreate loan contract - invalid tokenCategory',
      },
      {
        ip: 98,
        line: 73,
        message: 'Recreate loan contract - should have zero token amount',
      },
      {
        ip: 103,
        line: 76,
      },
      {
        ip: 108,
        line: 77,
      },
      {
        ip: 113,
        line: 78,
      },
      {
        ip: 117,
        line: 79,
      },
      {
        ip: 122,
        line: 80,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:34.644Z',
} as const;
