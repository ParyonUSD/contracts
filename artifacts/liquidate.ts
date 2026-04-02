export default {
  contractName: 'liquidateLoan',
  constructorInputs: [
    {
      name: 'stabilityPoolTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'liquidate',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_4 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_6 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_6 OP_UTXOTOKENCOMMITMENT OP_2 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_SWAP OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_SWAP OP_6 OP_SPLIT OP_DROP OP_BIN2NUM OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_9 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_1 OP_UTXOVALUE OP_10 OP_MUL OP_11 OP_DIV OP_SWAP OP_MUL 00e1f505 OP_DIV OP_SWAP OP_BIN2NUM OP_LESSTHAN OP_VERIFY OP_1 OP_OUTPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCOMMITMENT OP_3 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\n\n// Liquidate loan contract function\n// Is used by the StabilityPool to liquidate undercollateralized loans\n// The loan gets closed, the stabilityPool repays the loan\'s debt and takes the loan\'s BCH collateral in return\n\n/*  --- State Immutable NFT ---\n    byte identifier == 0x01\n*/\n\n// Note: This function can only be called if there are no ongoing redemptions against the loan\n\ncontract liquidateLoan(\n  bytes32 stabilityPoolTokenId\n  ) {\n      // function liquidate\n      // During loan liquidation requires that loan is under the required collateral amount and there\'s no pending redemptions\n      // StabilityPool pays for the transaction fees (normally no external fee input required).\n      //\n      // Inputs: 00-PriceContract, 01-loan, 02-loanTokenSidecar, 03-LoanLiquidate, 04-stabilityPool, 05-stabilityPoolSidecar, 06-liquidateLoan, ?07-feeBch\n      // Outputs: 00-PriceContract, 01-LoanLiquidate, 02-stabilityPool, 03-stabilityPoolSidecar, 04-liquidateLoan, 05-opreturn, ?06-BchChange\n\n    function liquidate(){\n      // Require function to be at inputIndex 3\n      require(this.activeInputIndex == 3);\n\n      // Authenticate PriceContract at inputIndex 0\n      bytes paryonTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\n      require(tx.inputs[0].tokenCategory == paryonTokenId + 0x01);\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x00);\n\n      // Authenticate Loan at inputIndex 1, nftCommitment checked later\n      require(tx.inputs[1].tokenCategory == paryonTokenId + 0x01);\n\n      // Authenticate stabilityPool\n      require(tx.inputs[4].tokenCategory == stabilityPoolTokenId + 0x02);\n\n      // Authenticate stabilityPool LiquidateLoan function\n      require(tx.inputs[6].tokenCategory == stabilityPoolTokenId);\n      require(tx.inputs[6].nftCommitment == 0x02);\n\n      // Parse loan state\n      bytes loanState = tx.inputs[1].nftCommitment;\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\n      require(identifier == 0x01);\n      bytes6 amountBeingRedeemed = remainingPartLoanState.split(6)[0];\n\n      // Loan should not have redemptions ongoing\n      require(int(amountBeingRedeemed) == 0);\n\n      // Read latest price from PriceContract contract\n      bytes4 oraclePriceBytes = tx.inputs[0].nftCommitment.slice(5,9);\n      int oraclePrice = int(oraclePriceBytes);\n\n      // Calculate maximum borrow amount to check liquidation condition\n      int collateral = tx.inputs[1].value;\n      // Collateral has to be 10% greater than maxBorrowBase\n      int maxBorrowBase = ((collateral * 10) / 11);\n      int maxBorrow = maxBorrowBase * oraclePrice / 100_000_000;\n      int borrowedAmount = int(borrowedAmountBytes);\n      // Check liquidation condition\n      require(borrowedAmount > maxBorrow, "Invalid liquidation, collateral ratio not below liquidation threshold");\n\n      // StabilityPool LiquidateLoan function enforces the repayment amount is burned at outputIndex 5\n\n      // Recreate functionContract at output 1\n      require(tx.outputs[1].lockingBytecode == tx.inputs[3].lockingBytecode);\n      require(tx.outputs[1].nftCommitment == tx.inputs[3].nftCommitment);\n      require(tx.outputs[1].tokenCategory == tx.inputs[3].tokenCategory);\n      require(tx.outputs[1].value == 1000);\n      require(tx.outputs[1].tokenAmount == 0);\n    }\n}',
  debug: {
    bytecode: 'c0539dc0ce00ce78517e8800cf517f7501008851ce7c517e8854ce78527e8856ce8856cf528851cf577f7c517f7c51887c567f7581009d00cf597f75557f778151c65a955b967c950400e1f505967c819f6951cd53c78851d253cf8851d153ce8851cc02e8039d51d3009c',
    sourceMap: '25:14:25:35;:39::40;:6::42:1;28:38:28:59:0;:28::74:1;29:24:29:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;30:24:30:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;33:24:33:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;36:24:36:25:0;:14::40:1;:44::64:0;:67::71;:44:::1;:6::73;39:24:39:25:0;:14::40:1;:6::66;40:24:40:25:0;:14::40:1;:44::48:0;:6::50:1;43:34:43:35:0;:24::50:1;44:80:44:81:0;:64::82:1;45:52:45:70:0;:77::78;:52::79:1;46:14:46:24:0;:28::32;:6::34:1;47:35:47:57:0;:64::65;:35::66:1;:::69;50:14:50:38;:42::43:0;:6::45:1;53:42:53:43:0;:32::58:1;:67::68:0;:32::69:1;;:65::66:0;:32::69:1;;54:24:54:45;57:33:57:34:0;:23::41:1;59:41:59:43:0;:28:::1;:47::49:0;:27:::1;60:38:60::0;:22:::1;:52::63:0;:22:::1;61:31:61:50:0;:27::51:1;63:14:63:40;:6::115;68:25:68:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;69:25:69:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;70:25:70:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;71:25:71:26:0;:14::33:1;:37::41:0;:6::43:1;72:25:72:26:0;:14::39:1;:43::44:0;:6::46:1',
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
        ip: 30,
        line: 36,
      },
      {
        ip: 33,
        line: 39,
      },
      {
        ip: 37,
        line: 40,
      },
      {
        ip: 47,
        line: 46,
      },
      {
        ip: 54,
        line: 50,
      },
      {
        ip: 77,
        line: 63,
        message: 'Invalid liquidation, collateral ratio not below liquidation threshold',
      },
      {
        ip: 82,
        line: 68,
      },
      {
        ip: 87,
        line: 69,
      },
      {
        ip: 92,
        line: 70,
      },
      {
        ip: 96,
        line: 71,
      },
      {
        ip: 101,
        line: 72,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-01T14:01:32.705Z',
} as const;
