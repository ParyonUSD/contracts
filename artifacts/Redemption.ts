export default {
  contractName: 'Redemption',
  constructorInputs: [
    {
      name: 'paryonTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'finalizeRedemption',
      inputs: [],
    },
    {
      name: 'swapTargetLoan',
      inputs: [],
    },
  ],
  bytecode: 'OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_2 OP_UTXOTOKENCOMMITMENT OP_3 OP_EQUALVERIFY OP_4 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_4 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUALVERIFY OP_5 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_5 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_2 OP_ADD OP_NUMEQUALVERIFY OP_0 OP_UTXOVALUE OP_0 OP_OUTPUTVALUE OP_SUB e803 OP_MAX OP_4 OP_UTXOTOKENCOMMITMENT 14 OP_SPLIT OP_DROP 76a914 OP_SWAP OP_CAT 88ac OP_CAT OP_4 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_4 OP_OUTPUTVALUE OP_ROT OP_NUMEQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_5 OP_UTXOTOKENAMOUNT OP_3 OP_OUTPUTTOKENAMOUNT OP_SUB OP_DUP OP_0 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_5 OP_OUTPUTBYTECODE OP_2 OP_PICK OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_3 OP_PICK OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENAMOUNT OP_OVER OP_NUMEQUALVERIFY OP_ELSE OP_TXOUTPUTCOUNT OP_5 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_LESSTHANOREQUAL OP_VERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_GREATERTHAN OP_IF OP_6 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_7 OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_SWAP OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_2 OP_UTXOTOKENCOMMITMENT OP_6 OP_EQUALVERIFY OP_4 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_4 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUALVERIFY OP_5 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_5 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_5 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_2 OP_ADD OP_NUMEQUALVERIFY OP_6 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_6 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_6 OP_UTXOTOKENCOMMITMENT 14 OP_SPLIT OP_DROP OP_14 OP_SPLIT OP_NIP OP_4 OP_SPLIT OP_BIN2NUM OP_0 OP_UTXOTOKENCOMMITMENT 14 OP_SPLIT OP_DROP OP_14 OP_SPLIT OP_NIP OP_4 OP_SPLIT OP_BIN2NUM OP_ROT OP_GREATERTHAN OP_VERIFY OP_EQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTBYTECODE OP_4 OP_UTXOBYTECODE OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCOMMITMENT OP_4 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_5 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_5 OP_OUTPUTBYTECODE OP_5 OP_UTXOBYTECODE OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_5 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENAMOUNT OP_5 OP_UTXOTOKENAMOUNT OP_NUMEQUAL OP_ENDIF',
  source: 'pragma cashscript ^0.12.0;\n\n// Individual redemption contract, processes an ongoing redemption against a target loan\n// Always tied to a redemptionStateSidecar and a redemptionTokenSidecar\n// Either the redemptions finalizes against the target loan or the redemption target gets swapped for a lower interest loan\n// The target loan + redemptionAmount of the redemption is kept in a mutable NFT on the redemption itself\n// The payout address (redeemerPkh) and redemptionPrice are stored in the redemptionStateSidecar as an immutable NFT\n\n/*  --- State redemption Mutable NFT ---\n    bytes32 targetLoanTokenId\n    bytes6 redemptionAmount (tokens)\n*/\n\n/*  --- State redemptionSidecar Immutable NFT ---\n    bytes20 redeemerPkh\n    bytes4 redemptionPrice\n*/\n\ncontract Redemption(\n    bytes32 paryonTokenId\n  ) {\n      // function finalizeRedemption\n      // Completes the redemption against the target loan, redeems ParyonUSD tokens for BCH collateral\n      // Any redemption still pending when a newer period starts can be cancelled\n      // The redemption pays for the transaction fees (normally no external fee input required).\n      //\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-loanFunction, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, ?06-feeBch\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-loanFunction, 03-opreturn, 04-payoutRedemption, 05?-tokenChangeOutput, ?06-BchChange\n    function finalizeRedemption(){\n      // Require redemption to be at inputIndex 3\n      require(this.activeInputIndex == 3);\n\n      // Authenticate Loan at inputIndex 0\n      require(tx.inputs[0].tokenCategory == paryonTokenId + 0x01);\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x01);\n\n      // Authenticate redeem loanFunction at inputIndex 2\n      require(tx.inputs[2].tokenCategory == paryonTokenId);\n      require(tx.inputs[2].nftCommitment == 0x03);\n\n      // Authenticate redemptionStateSidecar at inputIndex 4\n      require(tx.inputs[4].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\n      require(tx.inputs[4].outpointIndex == tx.inputs[3].outpointIndex + 1);\n\n      // Authenticate redemptionTokenSidecar at inputIndex 5\n      require(tx.inputs[5].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\n      require(tx.inputs[5].outpointIndex == tx.inputs[3].outpointIndex + 2);\n\n      // Specific logic for redemption or cancellation is enforced in the redeem loan function\n      // The redeem loan function enforces the final redemption amount to be burned to an opreturn at output index 3\n      // The redemption enforces the redemptionPayout and tokenChangeOutput are correct\n\n      // Calculate new redemption payout amount, clamp to minimum 1000 sats\n      // The redeem loan function calculates the new loan collateral, which we can read through introspection\n      int redeemedCollateral = tx.inputs[0].value - tx.outputs[0].value;\n      int redeemedCollateralClamped = max(redeemedCollateral, 1000);\n\n      // Read state from redemptionStateSidecar\n      bytes20 redeemerPkh = tx.inputs[4].nftCommitment.split(20)[0];\n\n      // Create redemptionPayout at output index 4\n      bytes25 redeemerLockingBytecode = new LockingBytecodeP2PKH(redeemerPkh);\n      require(tx.outputs[4].lockingBytecode == redeemerLockingBytecode);\n      require(tx.outputs[4].value == redeemedCollateralClamped);\n      require(tx.outputs[4].tokenCategory == 0x);\n\n      // The original redemption amount is read from the token sidecar at index 5 (not from the redemption state)\n      int originalRedemptionAmount = tx.inputs[5].tokenAmount; \n      // The finalized redemption amount is read from the opreturn output at index 3\n      // The output tokenAmount is enforced by the redeem loan function (called redemptionAmountToFinalize)\n      int finalizedRedemptionAmount = tx.outputs[3].tokenAmount;\n\n      // Calculate token change amount to send back to redeemer\n      int tokenChangeAmount = originalRedemptionAmount - finalizedRedemptionAmount;\n\n      // Check if token change output is needed\n      if(tokenChangeAmount > 0){\n        // Create tokenChangeOutput at output index 5\n        require(tx.outputs[5].value == 1000);\n        require(tx.outputs[5].lockingBytecode == redeemerLockingBytecode);\n        require(tx.outputs[5].tokenCategory == paryonTokenId);\n        require(tx.outputs[5].tokenAmount == tokenChangeAmount);\n      } else {\n        // If no token change, optionally allow output index 5 for BCH change but prevent holding tokens\n        if(tx.outputs.length > 5){\n          require(tx.outputs[5].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\n        }\n        // No seventh output should be present if there is no token change for the redemption\n        require(tx.outputs.length <= 6);\n      }\n\n      // Optionally allow output index 6 for BCH change but prevent holding tokens\n      if(tx.outputs.length > 6){\n        require(tx.outputs[6].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\n      }\n\n      // Restrict maximum outputs to 7 total not to recreate redemption outputs\n      require(tx.outputs.length <= 7);\n    }\n      // function swapTargetLoan\n      // Swaps the original target loan with a compatible one with a lower interest rate.\n      // The redemption can pay for the transaction fees of one redemption-swap (normally no external fee input required).\n      //\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-feeBch\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-changeBch\n    function swapTargetLoan(){\n      // Require redemption to be at inputIndex 3\n      require(this.activeInputIndex == 3);\n\n      // Authenticate Loan at inputIndex 0\n      require(tx.inputs[0].tokenCategory == paryonTokenId + 0x01);\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x01);\n\n      // Authenticate swapOutRedemption loanFunction at inputIndex 2\n      require(tx.inputs[2].tokenCategory == paryonTokenId);\n      require(tx.inputs[2].nftCommitment == 0x06);\n\n      // Authenticate redemptionStateSidecar at inputIndex 4\n      require(tx.inputs[4].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\n      require(tx.inputs[4].outpointIndex == tx.inputs[3].outpointIndex + 1);\n\n      // Authenticate redemptionTokenSidecar at inputIndex 5\n      require(tx.inputs[5].tokenCategory == paryonTokenId);\n      require(tx.inputs[5].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\n      require(tx.inputs[5].outpointIndex == tx.inputs[3].outpointIndex + 2);\n\n      // Authenticate Loan at inputIndex 6\n      require(tx.inputs[6].tokenCategory == paryonTokenId + 0x01);\n      require(tx.inputs[6].nftCommitment.split(1)[0] == 0x01);\n\n      // Parse swappedIn loan state\n      bytes swappedInLoanCommitment = tx.inputs[6].nftCommitment;\n      bytes6 swappedInLoanCommitmentSlice = swappedInLoanCommitment.slice(14,20);\n      bytes4 swappedInlastPeriodInterestPaidBytes, bytes2 swappedInCurrentInterestBytes = swappedInLoanCommitmentSlice.split(4);\n      int swappedInCurrentInterest = int(swappedInCurrentInterestBytes);\n\n      // Parse swappedOut loan state\n      bytes swappedOutLoanCommitment = tx.inputs[0].nftCommitment;\n      bytes6 swappedOutLoanCommitmentSlice = swappedOutLoanCommitment.slice(14,20);\n      bytes4 swappedOutlastPeriodInterestPaidBytes, bytes2 swappedOutCurrentInterestBytes = swappedOutLoanCommitmentSlice.split(4);\n      int swappedOutCurrentInterest = int(swappedOutCurrentInterestBytes);\n\n      // Check swappedOut pays higher interest\n      require(swappedInCurrentInterest < swappedOutCurrentInterest);\n\n      // Check that both loan lastPeriodInterestPaid states are equal (and thus are in the same period)\n      require(swappedInlastPeriodInterestPaidBytes == swappedOutlastPeriodInterestPaidBytes);\n\n      // Recreate redemption contract at output index 3\n      require(tx.outputs[3].lockingBytecode == tx.inputs[3].lockingBytecode);\n      require(tx.outputs[3].tokenCategory == tx.inputs[3].tokenCategory);\n      require(tx.outputs[3].value == 1000);\n      // Logic for updating redemption state is enforced in the swapInRedemption contract function\n\n      // Replicate state sidecar at output index 4\n      require(tx.outputs[4].value == 1000);\n      require(tx.outputs[4].lockingBytecode == tx.inputs[4].lockingBytecode);\n      require(tx.outputs[4].tokenCategory == tx.inputs[4].tokenCategory);\n      require(tx.outputs[4].nftCommitment == tx.inputs[4].nftCommitment);\n\n      // Replicate tokensidecar at output index 5\n      require(tx.outputs[5].value == 1000);\n      require(tx.outputs[5].lockingBytecode == tx.inputs[5].lockingBytecode);\n      require(tx.outputs[5].tokenCategory == tx.inputs[5].tokenCategory);\n      require(tx.outputs[5].tokenAmount == tx.inputs[5].tokenAmount);\n\n      // Logic for updating loan state is enforced in the loan contract function\n    }\n}',
  debug: {
    bytecode: '78009c63c0539d00ce78517e8800cf517f75518852ce788852cf538854c853c88854c953c98b9d55c853c88855c953c952939d00c600cc9402e803a454cf01147f750376a9147c7e0288ac7e54cd788854cc7b9d54d1008855d053d3947600a06355cc02e8039d55cd52798855d153798855d3789d67c455a06355d1008868c456a16968c456a06356d1008868c457a1696d6d51677c519dc0539d00ce78517e8800cf517f75518852ce788852cf568854c853c88854c953c98b9d55ce788855c853c88855c953c952939d56ce7c517e8856cf517f75518856cf01147f755e7f77547f8100cf01147f755e7f77547f817ba0698853cd53c78853d153ce8853cc02e8039d54cc02e8039d54cd54c78854d154ce8854d254cf8855cc02e8039d55cd55c78855d155ce8855d355d09c68',
    sourceMap: '29:4:99:5;;;;31:14:31:35;:39::40;:6::42:1;34:24:34:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;35:24:35:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;38:24:38:25:0;:14::40:1;:44::57:0;:6::59:1;39:24:39:25:0;:14::40:1;:44::48:0;:6::50:1;42:24:42:25:0;:14::50:1;:64::65:0;:54::90:1;:6::92;43:24:43:25:0;:14::40:1;:54::55:0;:44::70:1;:::74;:6::76;46:24:46:25:0;:14::50:1;:64::65:0;:54::90:1;:6::92;47:24:47:25:0;:14::40:1;:54::55:0;:44::70:1;:73::74:0;:44:::1;:6::76;55:41:55:42:0;:31::49:1;:63::64:0;:52::71:1;:31;56:62:56:66:0;:38::67:1;59::59:39:0;:28::54:1;:61::63:0;:28::64:1;:::67;62:40:62:77:0;:65::76;:40::77:1;;;63:25:63:26:0;:14::43:1;:47::70:0;:6::72:1;64:25:64:26:0;:14::33:1;:37::62:0;:6::64:1;65:25:65:26:0;:14::41:1;:45::47:0;:6::49:1;68:47:68:48:0;:37::61:1;71:49:71:50:0;:38::63:1;74:30:74:82;77:9:77:26:0;:29::30;:9:::1;:31:83:7:0;79:27:79:28;:16::35:1;:39::43:0;:8::45:1;80:27:80:28:0;:16::45:1;:49::72:0;;:8::74:1;81:27:81:28:0;:16::43:1;:47::60:0;;:8::62:1;82:27:82:28:0;:16::41:1;:45::62:0;:8::64:1;83:13:90:7:0;85:11:85:28;:31::32;:11:::1;:33:87:9:0;86:29:86:30;:18::45:1;:49::51:0;:10::104:1;85:33:87:9;89:16:89:33:0;:37::38;:16:::1;:8::40;83:13:90:7;93:9:93:26:0;:29::30;:9:::1;:31:95:7:0;94:27:94:28;:16::43:1;:47::49:0;:8::102:1;93:31:95:7;98:14:98:31:0;:35::36;:14:::1;:6::38;29:4:99:5;;;;106::168::0;;;108:14:108:35;:39::40;:6::42:1;111:24:111:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;112:24:112:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;115:24:115:25:0;:14::40:1;:44::57:0;:6::59:1;116:24:116:25:0;:14::40:1;:44::48:0;:6::50:1;119:24:119:25:0;:14::50:1;:64::65:0;:54::90:1;:6::92;120:24:120:25:0;:14::40:1;:54::55:0;:44::70:1;:::74;:6::76;123:24:123:25:0;:14::40:1;:44::57:0;:6::59:1;124:24:124:25:0;:14::50:1;:64::65:0;:54::90:1;:6::92;125:24:125:25:0;:14::40:1;:54::55:0;:44::70:1;:73::74:0;:44:::1;:6::76;128:24:128:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;129:24:129:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;132:48:132:49:0;:38::64:1;133:77:133:79:0;:44::80:1;;:74::76:0;:44::80:1;;134:125:134:126:0;:90::127:1;135:37:135:71;138:49:138:50:0;:39::65:1;139:79:139:81:0;:45::82:1;;:76::78:0;:45::82:1;;140:128:140:129:0;:92::130:1;141:38:141:73;144:14:144:38:0;:::66:1;:6::68;147::147:93;150:25:150:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;151:25:151:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;152:25:152:26:0;:14::33:1;:37::41:0;:6::43:1;156:25:156:26:0;:14::33:1;:37::41:0;:6::43:1;157:25:157:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;158:25:158:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;159:25:159:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;162:25:162:26:0;:14::33:1;:37::41:0;:6::43:1;163:25:163:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;164:25:164:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;165:25:165:26:0;:14::39:1;:53::54:0;:43::67:1;:6::69;19:0:169:1',
    logs: [],
    requires: [
      {
        ip: 7,
        line: 31,
      },
      {
        ip: 13,
        line: 34,
      },
      {
        ip: 20,
        line: 35,
      },
      {
        ip: 24,
        line: 38,
      },
      {
        ip: 28,
        line: 39,
      },
      {
        ip: 33,
        line: 42,
      },
      {
        ip: 39,
        line: 43,
      },
      {
        ip: 44,
        line: 46,
      },
      {
        ip: 51,
        line: 47,
      },
      {
        ip: 72,
        line: 63,
      },
      {
        ip: 76,
        line: 64,
      },
      {
        ip: 80,
        line: 65,
      },
      {
        ip: 93,
        line: 79,
      },
      {
        ip: 98,
        line: 80,
      },
      {
        ip: 103,
        line: 81,
      },
      {
        ip: 107,
        line: 82,
      },
      {
        ip: 116,
        line: 86,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 121,
        line: 89,
      },
      {
        ip: 130,
        line: 94,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 135,
        line: 98,
      },
      {
        ip: 145,
        line: 108,
      },
      {
        ip: 151,
        line: 111,
      },
      {
        ip: 158,
        line: 112,
      },
      {
        ip: 162,
        line: 115,
      },
      {
        ip: 166,
        line: 116,
      },
      {
        ip: 171,
        line: 119,
      },
      {
        ip: 177,
        line: 120,
      },
      {
        ip: 181,
        line: 123,
      },
      {
        ip: 186,
        line: 124,
      },
      {
        ip: 193,
        line: 125,
      },
      {
        ip: 199,
        line: 128,
      },
      {
        ip: 206,
        line: 129,
      },
      {
        ip: 231,
        line: 144,
      },
      {
        ip: 232,
        line: 147,
      },
      {
        ip: 237,
        line: 150,
      },
      {
        ip: 242,
        line: 151,
      },
      {
        ip: 246,
        line: 152,
      },
      {
        ip: 250,
        line: 156,
      },
      {
        ip: 255,
        line: 157,
      },
      {
        ip: 260,
        line: 158,
      },
      {
        ip: 265,
        line: 159,
      },
      {
        ip: 269,
        line: 162,
      },
      {
        ip: 274,
        line: 163,
      },
      {
        ip: 279,
        line: 164,
      },
      {
        ip: 285,
        line: 165,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:40.284Z',
} as const;
