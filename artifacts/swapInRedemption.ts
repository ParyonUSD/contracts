export default {
  contractName: 'swapInRedemption',
  constructorInputs: [
    {
      name: 'redemptionTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'swapInRedemption',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_8 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_2 OP_UTXOTOKENCOMMITMENT OP_6 OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_ROT OP_1 OP_CAT OP_EQUALVERIFY OP_6 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_6 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_OVER OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_SWAP OP_6 OP_SPLIT OP_DUP OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUALVERIFY OP_ROT OP_BIN2NUM OP_ROT OP_BIN2NUM OP_SWAP OP_OVER OP_SUB OP_DUP OP_0 OP_GREATERTHAN OP_VERIFY OP_5 OP_UTXOTOKENAMOUNT OP_SWAP OP_MIN OP_SWAP OP_OVER OP_ADD OP_7 OP_UTXOTOKENCATEGORY OP_ROT OP_6 OP_NUM2BIN OP_CAT OP_3 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_ROT OP_SWAP OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_6 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_6 OP_OUTPUTBYTECODE OP_6 OP_UTXOBYTECODE OP_EQUALVERIFY OP_6 OP_OUTPUTVALUE OP_6 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_6 OP_OUTPUTTOKENCATEGORY OP_6 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_6 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_8 OP_OUTPUTBYTECODE OP_8 OP_UTXOBYTECODE OP_EQUALVERIFY OP_8 OP_OUTPUTTOKENCOMMITMENT OP_8 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_8 OP_OUTPUTTOKENCATEGORY OP_8 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_8 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_8 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// SwapInRedemption loan contract function\r\n// Is used by an existing redemption, to change target of the redemption to be a lower interest loan than the original target loan\r\n// This function is attached to the lower interest loan that is being swapped in\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x05\r\n*/\r\n\r\n// Note: swapInRedemption can only be performed against loans with status "0x02" (mature loan)\r\n// This is to prevent new loans being created just to be used as swap-in targets for existing redemptions\r\n// which could be used to cancel redemptions and in effect receive a free price-option (see docs for more info)\r\n\r\ncontract swapInRedemption(\r\n  bytes32 redemptionTokenId\r\n  ) {\r\n      // function swapInRedemption\r\n      // Swaps in a lower interest paying loan as target loan for an active redemption\r\n      // The redemption can pay for the transaction fees of one redemption-swap (normally no external fee input required).\r\n      //\r\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-feeBch\r\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-changeBch\r\n\r\n    function swapInRedemption(){\r\n      // Require function to be at inputIndex 8\r\n      require(this.activeInputIndex == 8);\r\n      bytes parityTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n\r\n      // Authenticate Loan at inputIndex 0\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x01);\r\n\r\n      // Authenticate swapOutRedemption at inputIndex 2\r\n      require(tx.inputs[2].tokenCategory == parityTokenId);\r\n      require(tx.inputs[2].nftCommitment == 0x06);\r\n\r\n      // Authenticate redemption\r\n      require(tx.inputs[3].tokenCategory == redemptionTokenId + 0x01);\r\n\r\n      // Authenticate lower interest Loan at inputIndex 6, nftCommitment checked below\r\n      require(tx.inputs[6].tokenCategory == parityTokenId + 0x01);\r\n\r\n      // Parse loan state\r\n      bytes loanState = tx.inputs[6].nftCommitment;\r\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\r\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\r\n      require(identifier == 0x01);\r\n      bytes6 amountBeingRedeemedBytes, bytes lastPartLoanState = remainingPartLoanState.split(6);\r\n      byte loanStatus = lastPartLoanState.split(1)[0];\r\n\r\n      // This prevents new loans from being created just to swap targets of existing redemptions\r\n      require(loanStatus == 0x02, "swapInRedemption can only be performed against mature loans");\r\n\r\n      // The interest rate comparison for swapRedemption happens in the Redemption contract\r\n\r\n      // Calculate redeemableDebt available for new redemption\r\n      int borrowedAmount = int(borrowedAmountBytes);\r\n      int amountBeingRedeemed = int(amountBeingRedeemedBytes);\r\n      int redeemableDebt = borrowedAmount - amountBeingRedeemed;\r\n      // Check that swapIn loan is not fully being redeemed already\r\n      // Implicitly also checks that loan debt is non-zero\r\n      require(redeemableDebt > 0);\r\n\r\n      // Read original redemption amount from sidecar (not from state which is the current amount being redeemed)\r\n      int originalRedemptionAmount = tx.inputs[5].tokenAmount;\r\n\r\n      // New redemption amount should be the either originalRedemptionAmount or the maximum amount that can be still be redeemed\r\n      // We take the minimum of both values (to avoid over-redeeming the loan)\r\n      int newRedemptionAmount = min(originalRedemptionAmount, redeemableDebt);\r\n\r\n      // Add redemption amount to amountBeingRedeemed because loan is being swapped in\r\n      int newAmountBeingRedeemed = amountBeingRedeemed + newRedemptionAmount;\r\n\r\n      // Update mutable redemption state at output index 3\r\n      // Read swappedIn tokenId from loansidecar at inputIndex 7\r\n      bytes swappedInLoanTokenId = tx.inputs[7].tokenCategory;\r\n      bytes6 newRedemptionAmountBytes = bytes6(newRedemptionAmount);\r\n      // Semantic typecast of \'swappedInLoanTokenId\' so the concatenated result is bytes38\r\n      bytes38 newRedemptionState = bytes32(swappedInLoanTokenId) + newRedemptionAmountBytes;\r\n      require(tx.outputs[3].nftCommitment == newRedemptionState);\r\n      // Logic for recreation of redemption contract is enforced in the redemption contract\r\n\r\n      // Construct new loan state\r\n      bytes27 newLoanState = firstPartLoanState + bytes6(newAmountBeingRedeemed) + bytes14(lastPartLoanState);\r\n\r\n      // Recreate loan contract with new state at output index 6\r\n      require(tx.outputs[6].nftCommitment == newLoanState, "Invalid state loan contract - wrong nftCommitment");\r\n      require(tx.outputs[6].lockingBytecode == tx.inputs[6].lockingBytecode, "Recreate loan contract - invalid lockingBytecode");\r\n      require(tx.outputs[6].value == tx.inputs[6].value, "Recreate loan contract with same BCH amount");\r\n      require(tx.outputs[6].tokenCategory == tx.inputs[6].tokenCategory, "Recreate loan contract - invalid tokenCategory");\r\n      require(tx.outputs[6].tokenAmount == 0, "Recreate loan contract - should have zero token amount");\r\n\r\n      // Recreate functionContract at output index 8\r\n      require(tx.outputs[8].lockingBytecode == tx.inputs[8].lockingBytecode);\r\n      require(tx.outputs[8].nftCommitment == tx.inputs[8].nftCommitment);\r\n      require(tx.outputs[8].tokenCategory == tx.inputs[8].tokenCategory);\r\n      require(tx.outputs[8].value == 1000);\r\n      require(tx.outputs[8].tokenAmount == 0);\r\n    }\r\n}',
  debug: {
    bytecode: 'c0589dc0ce00ce78517e8800cf517f75518852ce788852cf568853ce7b517e8856ce7c517e8856cf577f78517f7c51887c567f76517f7552887b817b817c78947600a06955d07ca37c789357ce7b56807e53d2887b7c56807e7c7e56d28856cd56c78856cc56c69d56d156ce8856d3009d58cd58c78858d258cf8858d158ce8858cc02e8039d58d3009c',
    sourceMap: '27:14:27:35;:39::40;:6::42:1;28:38:28:59:0;:28::74:1;31:24:31:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;32:24:32:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;35:24:35:25:0;:14::40:1;:44::57:0;:6::59:1;36:24:36:25:0;:14::40:1;:44::48:0;:6::50:1;39:24:39:25:0;:14::40:1;:44::61:0;:64::68;:44:::1;:6::70;42:24:42:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;45:34:45:35:0;:24::50:1;46:80:46:81:0;:64::82:1;47:52:47:70:0;:77::78;:52::79:1;48:14:48:24:0;:28::32;:6::34:1;49:65:49:87:0;:94::95;:65::96:1;50:24:50:41:0;:48::49;:24::50:1;:::53;53:28:53:32:0;:6::97:1;58:31:58:50:0;:27::51:1;59:36:59:60:0;:32::61:1;60:27:60:41:0;:44::63;:27:::1;63:14:63:28:0;:31::32;:14:::1;:6::34;66:47:66:48:0;:37::61:1;70:62:70:76:0;:32::77:1;73:35:73:54:0;:57::76;:35:::1;77:45:77:46:0;:35::61:1;78:47:78:66:0;:40::67:1;;80:35:80:91;81:25:81:26:0;:14::41:1;:6::65;85:29:85:47:0;:57::79;:50::80:1;;:29;:91::108:0;:29::109:1;88:25:88:26:0;:14::41:1;:6::112;89:25:89:26:0;:14::43:1;:57::58:0;:47::75:1;:6::129;90:25:90:26:0;:14::33:1;:47::48:0;:37::55:1;:6::104;91:25:91:26:0;:14::41:1;:55::56:0;:45::71:1;:6::123;92:25:92:26:0;:14::39:1;:43::44:0;:6::104:1;95:25:95:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;96:25:96:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;97:25:97:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;98:25:98:26:0;:14::33:1;:37::41:0;:6::43:1;99:25:99:26:0;:14::39:1;:43::44:0;:6::46:1',
    logs: [],
    requires: [
      {
        ip: 3,
        line: 27,
      },
      {
        ip: 11,
        line: 31,
      },
      {
        ip: 18,
        line: 32,
      },
      {
        ip: 22,
        line: 35,
      },
      {
        ip: 26,
        line: 36,
      },
      {
        ip: 32,
        line: 39,
      },
      {
        ip: 38,
        line: 42,
      },
      {
        ip: 48,
        line: 48,
      },
      {
        ip: 57,
        line: 53,
        message: 'swapInRedemption can only be performed against mature loans',
      },
      {
        ip: 68,
        line: 63,
      },
      {
        ip: 84,
        line: 81,
      },
      {
        ip: 94,
        line: 88,
        message: 'Invalid state loan contract - wrong nftCommitment',
      },
      {
        ip: 99,
        line: 89,
        message: 'Recreate loan contract - invalid lockingBytecode',
      },
      {
        ip: 104,
        line: 90,
        message: 'Recreate loan contract with same BCH amount',
      },
      {
        ip: 109,
        line: 91,
        message: 'Recreate loan contract - invalid tokenCategory',
      },
      {
        ip: 113,
        line: 92,
        message: 'Recreate loan contract - should have zero token amount',
      },
      {
        ip: 118,
        line: 95,
      },
      {
        ip: 123,
        line: 96,
      },
      {
        ip: 128,
        line: 97,
      },
      {
        ip: 132,
        line: 98,
      },
      {
        ip: 137,
        line: 99,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:46.903Z',
} as const;
