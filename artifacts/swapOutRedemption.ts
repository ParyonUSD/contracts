export default {
  contractName: 'swapOutRedemption',
  constructorInputs: [
    {
      name: 'redemptionTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'swapOutRedemption',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_OVER OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_SWAP OP_6 OP_SPLIT OP_ROT OP_BIN2NUM 1027 OP_GREATERTHANOREQUAL OP_VERIFY OP_3 OP_UTXOTOKENCATEGORY OP_4 OP_ROLL OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT 20 OP_SPLIT OP_1 OP_UTXOTOKENCATEGORY OP_ROT OP_EQUALVERIFY OP_ROT OP_BIN2NUM OP_SWAP OP_BIN2NUM OP_SUB OP_ROT OP_SWAP OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// SwapOutRedemption loan contract function\r\n// Is used by an existing redemption, to change target of the redemption to be a lower interest loan than the original target loan\r\n// This function is attached to the higher interest loan that is being swapped out\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x06\r\n*/\r\n\r\n// minimumLoanDebtForSwapOut = 100.00 ParityUSD\r\n\r\ncontract swapOutRedemption(\r\n  bytes32 redemptionTokenId\r\n  ) {\r\n      // function swapOutRedemption\r\n      // Swaps the taget loan of an active redemption out for a lower interest paying loan\r\n      // The redemption can pay for the transaction fees of one redemption-swap (normally no external fee input required).\r\n      //\r\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-feeBch\r\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-changeBch\r\n\r\n    function swapOutRedemption(){\r\n      // Require function to be at inputIndex 2\r\n      require(this.activeInputIndex == 2);\r\n      bytes parityTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n\r\n      // Authenticate Loan being redeemed at inputIndex 0, nftCommitment checked below\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n\r\n      // Parse loan state\r\n      bytes loanState = tx.inputs[0].nftCommitment;\r\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\r\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\r\n      require(identifier == 0x01);\r\n      bytes6 amountBeingRedeemedBytes, bytes lastPartLoanState = remainingPartLoanState.split(6);\r\n\r\n      // Loan can only be swapped out if the current loan meets minimum debt threshold\r\n      // Check minimumLoanDebtForSwapOut\r\n      require(int(borrowedAmountBytes) >= 100_00);\r\n\r\n      // Authenticate redemption\r\n      require(tx.inputs[3].tokenCategory == redemptionTokenId + 0x01);\r\n\r\n      // The interest rate comparison for swapRedemption happens in the Redemption contract\r\n\r\n      // Parse redemption state\r\n      bytes32 targetLoan, bytes redemptionAmountBytes = tx.inputs[3].nftCommitment.split(32);\r\n\r\n      // Require target loan to match tokenId\r\n      require(tx.inputs[1].tokenCategory == targetLoan);\r\n\r\n      // Deduct redemption amount from amountBeingRedeemed because loan is being swapped out\r\n      int newAmountBeingRedeemed = int(amountBeingRedeemedBytes) - int(redemptionAmountBytes);\r\n\r\n      // Construct new loan state\r\n      bytes27 newLoanState = firstPartLoanState + bytes6(newAmountBeingRedeemed) + bytes14(lastPartLoanState);\r\n\r\n      // Recreate loan contract with new state at outputIndex 0\r\n      require(tx.outputs[0].nftCommitment == newLoanState, "Invalid state loan contract - wrong nftCommitment");\r\n      require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate loan contract - invalid lockingBytecode");\r\n      require(tx.outputs[0].value == tx.inputs[0].value, "Recreate loan contract with same BCH amount");\r\n      require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate loan contract - invalid tokenCategory");\r\n      require(tx.outputs[0].tokenAmount == 0, "Recreate loan contract - should have zero token amount");\r\n\r\n      // Recreate functionContract at output index 2\r\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\r\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\r\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\r\n      require(tx.outputs[2].value == 1000);\r\n      require(tx.outputs[2].tokenAmount == 0);\r\n    }\r\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce7c517e8800cf577f78517f7c51887c567f7b81021027a26953ce547a517e8853cf01207f51ce7b887b817c81947b7c56807e7c7e00d28800cd00c78800cc00c69d00d100ce8800d3009d52cd52c78852d252cf8852d152ce8852cc02e8039d52d3009c',
    sourceMap: '25:14:25:35;:39::40;:6::42:1;26:38:26:59:0;:28::74:1;29:24:29:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;32:34:32:35:0;:24::50:1;33:80:33:81:0;:64::82:1;34:52:34:70:0;:77::78;:52::79:1;35:14:35:24:0;:28::32;:6::34:1;36:65:36:87:0;:94::95;:65::96:1;40:18:40:37:0;:14::38:1;:42::48:0;:14:::1;:6::50;43:24:43:25:0;:14::40:1;:44::61:0;;:64::68;:44:::1;:6::70;48:66:48:67:0;:56::82:1;:89::91:0;:56::92:1;51:24:51:25:0;:14::40:1;:44::54:0;:6::56:1;54:39:54:63:0;:35::64:1;:71::92:0;:67::93:1;:35;57:29:57:47:0;:57::79;:50::80:1;;:29;:91::108:0;:29::109:1;60:25:60:26:0;:14::41:1;:6::112;61:25:61:26:0;:14::43:1;:57::58:0;:47::75:1;:6::129;62:25:62:26:0;:14::33:1;:47::48:0;:37::55:1;:6::104;63:25:63:26:0;:14::41:1;:55::56:0;:45::71:1;:6::123;64:25:64:26:0;:14::39:1;:43::44:0;:6::104:1;67:25:67:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;68:25:68:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;69:25:69:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;70:25:70:26:0;:14::33:1;:37::41:0;:6::43:1;71:25:71:26:0;:14::39:1;:43::44:0;:6::46:1',
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
        ip: 21,
        line: 35,
      },
      {
        ip: 29,
        line: 40,
      },
      {
        ip: 36,
        line: 43,
      },
      {
        ip: 44,
        line: 51,
      },
      {
        ip: 59,
        line: 60,
        message: 'Invalid state loan contract - wrong nftCommitment',
      },
      {
        ip: 64,
        line: 61,
        message: 'Recreate loan contract - invalid lockingBytecode',
      },
      {
        ip: 69,
        line: 62,
        message: 'Recreate loan contract with same BCH amount',
      },
      {
        ip: 74,
        line: 63,
        message: 'Recreate loan contract - invalid tokenCategory',
      },
      {
        ip: 78,
        line: 64,
        message: 'Recreate loan contract - should have zero token amount',
      },
      {
        ip: 83,
        line: 67,
      },
      {
        ip: 88,
        line: 68,
      },
      {
        ip: 93,
        line: 69,
      },
      {
        ip: 97,
        line: 70,
      },
      {
        ip: 102,
        line: 71,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:47.444Z',
} as const;
