export default {
  contractName: 'LiquidateLoan',
  constructorInputs: [
    {
      name: 'parityTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'liquidate',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_6 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT OP_1 OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUALVERIFY OP_4 OP_UTXOTOKENCOMMITMENT OP_10 OP_SPLIT OP_1 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_BIN2NUM OP_SWAP OP_BIN2NUM OP_OVER OP_SUB OP_DUP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_ROT OP_SWAP OP_CAT OP_2 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_4 OP_UTXOVALUE OP_1 OP_UTXOVALUE OP_ADD dc05 OP_SUB OP_2 OP_OUTPUTVALUE OP_NUMEQUALVERIFY OP_5 OP_UTXOTOKENAMOUNT OP_OVER OP_SUB OP_3 OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_4 OP_OUTPUTBYTECODE OP_6 OP_UTXOBYTECODE OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCOMMITMENT OP_6 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_6 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_4 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_ROT OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_5 OP_OUTPUTBYTECODE 6a OP_0 OP_SIZE OP_SWAP OP_CAT OP_CAT OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_6 OP_GREATERTHAN OP_IF OP_6 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_7 OP_LESSTHANOREQUAL',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// LiquidateLoan pool contract function\r\n// Enables the StabilityPool to liquidate any undercollateralized loan by repaying the loan\'s debt from its staked supply\r\n// The repayment of the debt is done by burning the parityUSD, this is done by sending them to an unspendable OP_RETURN output\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x02\r\n*/\r\n\r\n// Note: \'remainingStakedEpoch\' is the amount which is available to be used for liquidations\r\n// remainingStakedEpoch = totalStakedEpoch - totalLiquidationThisEpoch\r\n\r\ncontract LiquidateLoan(\r\n  bytes32 parityTokenId\r\n  ) {\r\n    // function liquidate\r\n    // Repays the outstanding ParityUSD debt on a liquidated loan from the StabilityPoolSidecar\'s recorded supply\r\n    // StabilityPool pays for the transaction fees (normally no external fee input required).\r\n    //\r\n    // Inputs: 00-pricecontract, 01-loan, 02-loanTokenSidecar, 03-LoanLiquidate, 04-stabilityPool, 05-stabilityPoolSidecar, 06-liquidateLoan, ?07-feeBch\r\n    // Outputs: 00-pricecontract, 01-LoanLiquidate, 02-StabilityPool, 03-stabilityPoolSidecar, 04-liquidateLoan, 05-opreturn, ?06-BchChange\r\n\r\n    function liquidate(){\r\n      // Require function to be at inputIndex 6\r\n      require(this.activeInputIndex== 6);\r\n\r\n      // Authenticate PriceContract at inputIndex 0\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x00);\r\n\r\n      // Authenticate Loan at inputIndex 1\r\n      require(tx.inputs[1].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[1].nftCommitment.split(1)[0] == 0x01);\r\n\r\n      // Authenticate loan functionContract at inputIndex 3\r\n      require(tx.inputs[3].tokenCategory == parityTokenId);\r\n      require(tx.inputs[3].nftCommitment == 0x01);\r\n\r\n      // Authenticate stabilityPool at inputIndex 4\r\n      bytes stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n      require(tx.inputs[4].tokenCategory == stabilityPoolTokenId + 0x02);\r\n\r\n      // Parse stabilitypool state\r\n      // bytes10 fixedState is the bytes4 periodPool + bytes6 totalStakedEpoch\r\n      bytes10 fixedState, bytes remainingStakedEpochBytes = tx.inputs[4].nftCommitment.split(10);\r\n\r\n      // Parse loan state\r\n      bytes6 borrowedTokenAmount = tx.inputs[1].nftCommitment.slice(1,7);\r\n      int amountDebtToRepay = int(borrowedTokenAmount);\r\n      int remainingStakedEpoch = int(remainingStakedEpochBytes);\r\n\r\n      // Stabilitypool can only use tokens staked since the previous epoch in liquidation\r\n      // The stabilitypool \'newRemainingStakedEpoch\' state is not allowed to go below zero\r\n      int newRemainingStakedEpoch = remainingStakedEpoch - amountDebtToRepay;\r\n      require(newRemainingStakedEpoch >= 0);\r\n\r\n      // The StabilityPool itself enforces the same lockingBytecode & tokenCategory\r\n      // Pool functions need to enforce the nftCommitment & value (and tokenAmount in sidecar)\r\n\r\n      // Update stabilitypool state\r\n      bytes newStateStabilityPool = fixedState + bytes(newRemainingStakedEpoch);\r\n      require(tx.outputs[2].nftCommitment == newStateStabilityPool);\r\n\r\n      // Move Loans BCH collateral to the StabilityPool, minus tx fee\r\n      int newStabilityPoolBalance = tx.inputs[4].value + tx.inputs[1].value - 1500;\r\n      require(tx.outputs[2].value == newStabilityPoolBalance);\r\n\r\n      // Protect stabilitypool tokensidecar from being drained\r\n      // Stabilitypool tokensidecar is at inputIndex 5, recreated at outputIndex 3 in liquidateLoan\r\n      int newTokenAmountPoolSidecar = tx.inputs[5].tokenAmount - amountDebtToRepay;\r\n      require(tx.outputs[3].tokenAmount == newTokenAmountPoolSidecar);\r\n\r\n      // Recreate functionContract exactly\r\n      require(tx.outputs[4].lockingBytecode == tx.inputs[6].lockingBytecode);\r\n      require(tx.outputs[4].nftCommitment == tx.inputs[6].nftCommitment);\r\n      require(tx.outputs[4].tokenCategory == tx.inputs[6].tokenCategory);\r\n      require(tx.outputs[4].value == 1000);\r\n\r\n      // Burn repaid ParityUSD by sending to unspendable opreturn output at index 5\r\n      require(tx.outputs[5].tokenCategory == parityTokenId);\r\n      require(tx.outputs[5].tokenAmount == amountDebtToRepay);\r\n      require(tx.outputs[5].lockingBytecode == new LockingBytecodeNullData([0x]));\r\n\r\n      // Optionally create bch change output at outputIndex 6\r\n      if (tx.outputs.length > 6) {\r\n        require(tx.outputs[6].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");\r\n      }\r\n\r\n      // Restrict maximum outputs to 7 total to protect StabilityPool minting capability\r\n      require(tx.outputs.length <= 7);\r\n    }\r\n}',
  debug: {
    bytecode: 'c0569d00ce78517e8800cf517f7501008851ce78517e8851cf517f75518853ce788853cf5188c0ce54ce7c527e8854cf5a7f51cf577f75517f77817c8178947600a2697b7c7e52d28854c651c69302dc059452cc9d55d0789453d39d54cd56c78854d256cf8854d156ce8854cc02e8039d55d17b8855d39d55cd016a00827c7e7e88c456a06356d1008868c457a1',
    sourceMap: '26:14:26:35;:38::39;:6::41:1;29:24:29:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;30:24:30:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;33:24:33:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;34:24:34:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;37:24:37:25:0;:14::40:1;:44::57:0;:6::59:1;38:24:38:25:0;:14::40:1;:44::48:0;:6::50:1;41:45:41:66:0;:35::81:1;42:24:42:25:0;:14::40:1;:44::64:0;:67::71;:44:::1;:6::73;46:70:46:71:0;:60::86:1;:93::95:0;:60::96:1;49:45:49:46:0;:35::61:1;:70::71:0;:35::72:1;;:68::69:0;:35::72:1;;50:30:50:54;51:37:51:62:0;:33::63:1;55:59:55:76:0;:36:::1;56:14:56:37:0;:41::42;:14:::1;:6::44;62:36:62:46:0;:55::78;:36::79:1;63:25:63:26:0;:14::41:1;:6::68;66:46:66:47:0;:36::54:1;:67::68:0;:57::75:1;:36;:78::82:0;:36:::1;67:25:67:26:0;:14::33:1;:6::62;71:48:71:49:0;:38::62:1;:65::82:0;:38:::1;72:25:72:26:0;:14::39:1;:6::70;75:25:75:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;76:25:76:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;77:25:77:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;78:25:78:26:0;:14::33:1;:37::41:0;:6::43:1;81:25:81:26:0;:14::41:1;:45::58:0;:6::60:1;82:25:82:26:0;:14::39:1;:6::62;83:25:83:26:0;:14::43:1;:47::80:0;:76::78;::::1;;;;:6::82;86:10:86:27:0;:30::31;:10:::1;:33:88:7:0;87:27:87:28;:16::43:1;:47::49:0;:8::109:1;86:33:88:7;91:14:91:31:0;:35::36;:6::38:1',
    logs: [],
    requires: [
      {
        ip: 3,
        line: 26,
      },
      {
        ip: 9,
        line: 29,
      },
      {
        ip: 16,
        line: 30,
      },
      {
        ip: 22,
        line: 33,
      },
      {
        ip: 29,
        line: 34,
      },
      {
        ip: 33,
        line: 37,
      },
      {
        ip: 37,
        line: 38,
      },
      {
        ip: 45,
        line: 42,
      },
      {
        ip: 66,
        line: 56,
      },
      {
        ip: 72,
        line: 63,
      },
      {
        ip: 82,
        line: 67,
      },
      {
        ip: 89,
        line: 72,
      },
      {
        ip: 94,
        line: 75,
      },
      {
        ip: 99,
        line: 76,
      },
      {
        ip: 104,
        line: 77,
      },
      {
        ip: 108,
        line: 78,
      },
      {
        ip: 112,
        line: 81,
      },
      {
        ip: 115,
        line: 82,
      },
      {
        ip: 124,
        line: 83,
      },
      {
        ip: 132,
        line: 87,
        message: 'Invalid BCH change output - should not hold any tokens',
      },
      {
        ip: 137,
        line: 91,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:52.824Z',
} as const;
