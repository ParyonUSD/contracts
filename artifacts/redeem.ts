export default {
  contractName: 'redeemLoan',
  constructorInputs: [
    {
      name: 'redemptionTokenId',
      type: 'bytes32',
    },
    {
      name: 'timelockRedemption',
      type: 'int',
    },
    {
      name: 'startBlockHeight',
      type: 'int',
    },
    {
      name: 'periodLengthBlocks',
      type: 'int',
    },
  ],
  abi: [
    {
      name: 'redeemOrCancel',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_ROT OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT 20 OP_SPLIT OP_BIN2NUM OP_DUP OP_1 OP_UTXOTOKENCATEGORY OP_3 OP_ROLL OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT 12 OP_SPLIT OP_DROP OP_14 OP_SPLIT OP_NIP OP_BIN2NUM OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_1ADD OP_5 OP_ROLL OP_SWAP OP_6 OP_ROLL OP_MUL OP_ADD OP_TXLOCKTIME OP_LESSTHANOREQUAL OP_TXLOCKTIME 0065cd1d OP_LESSTHAN OP_BOOLAND OP_IF OP_0 OP_CHECKLOCKTIMEVERIFY OP_2DROP OP_0 OP_ELSE OP_3 OP_INPUTSEQUENCENUMBER OP_DUP OP_5 OP_PICK OP_NUMEQUALVERIFY OP_DROP OP_ENDIF OP_4 OP_UTXOTOKENCOMMITMENT 14 OP_SPLIT OP_NIP OP_BIN2NUM OP_OVER 00e1f505 OP_MUL OP_SWAP OP_DIV OP_0 OP_UTXOVALUE OP_SWAP OP_SUB OP_0 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_SWAP OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_SWAP OP_6 OP_SPLIT OP_SWAP OP_BIN2NUM OP_5 OP_ROLL OP_SUB OP_ROT OP_BIN2NUM OP_4 OP_PICK OP_SUB OP_1 OP_SWAP OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTBYTECODE 6a OP_0 OP_SIZE OP_SWAP OP_CAT OP_CAT OP_EQUALVERIFY OP_DUP OP_0 OP_GREATERTHAN OP_IF OP_3 OP_OUTPUTTOKENCATEGORY OP_2 OP_PICK OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENAMOUNT OP_OVER OP_NUMEQUALVERIFY OP_ELSE OP_3 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_2DROP OP_DROP OP_1',
  source: 'pragma cashscript ^0.12.0;\n\n// Redeem loan contract function\n// Is used by a redemption to finalize the redemption process, redeems ParyonUSD tokens for BCH collateral from loan\n// Any redemption still pending when a newer period starts can be cancelled\n// This is to prevent the free option problem\n\n/*  --- State Immutable NFT ---\n    byte identifier == 0x03\n*/\n\ncontract redeemLoan(\n  bytes32 redemptionTokenId,\n  // Due to sequence-number encoding and BIP68 semantics, this value must be in the range 0..65535.\n  int timelockRedemption,\n  int startBlockHeight,\n  int periodLengthBlocks\n  ) {\n      // function redeemOrCancel\n      // Finalize redemption process, redeems ParyonUSD tokens for BCH collateral from loan\n      // If the redemption is still pending when a newer period starts, the redemption can be cancelled instead\n      // The redemption pays for the transaction fees (normally no external fee input required).\n      //\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-redeem, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, ?06-feeBch\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-redeem, 03-opreturn, 04-payoutRedemption, 05?-tokenChangeOutput, ?06-BchChange\n\n    function redeemOrCancel(){\n      // Require function to be at inputIndex 2\n      require(this.activeInputIndex == 2);\n      bytes paryonTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\n\n      // Authenticate loan at inputIndex 0, nftCommitment checked later\n      require(tx.inputs[0].tokenCategory == paryonTokenId + 0x01);\n\n      // Authenticate redemption at inputIndex 3\n      require(tx.inputs[3].tokenCategory == redemptionTokenId + 0x01);\n\n      // Read state from redemption\n      bytes32 targetLoan, bytes redemptionAmountBytes = tx.inputs[3].nftCommitment.split(32);\n      // The pendingRedemptionAmount is counted as part of the "amountBeingRedeemed" in the loan state\n      int pendingRedemptionAmount = int(redemptionAmountBytes);\n\n      // Normally the pending redemption amount becomes the effective redemption amount during finalization\n      // However, if the redemption is cancelled, the effective redemption amount is set to zero\n      // So the effective redemption amount gets overwritten if the redemption is cancelled (in isInNewPeriod block)\n      int effectiveRedemptionAmount = pendingRedemptionAmount;\n\n      // Require target loan to match tokenid\n      require(tx.inputs[1].tokenCategory == targetLoan);\n\n      // Parse current period from loan contract\n      bytes4 lastPeriodInterestPaidBytes = tx.inputs[0].nftCommitment.slice(14,18);\n      int currentPeriodLoan = int(lastPeriodInterestPaidBytes);\n\n      // Require transaction version 2 to be able to use relative timelocks (sequenceNumber)\n      require(tx.version == 2);\n\n      // Check if the locktime is in a newer period than the current loan period\n      // Any redemption still running when the new period starts can be cancelled\n      int newPeriod = currentPeriodLoan + 1;\n      int blockHeightNewPeriod = startBlockHeight + newPeriod * periodLengthBlocks;\n      // We restrict locktime to below 500 million as values above are unix timestamps instead of block heights\n      bool isInNewPeriod = tx.locktime >= blockHeightNewPeriod && tx.locktime < 500_000_000;\n\n      // If the redemption is in a new period, cancel the redemption\n      if(isInNewPeriod){\n        // Require timelocks are enabled; see contract_safety.md "Locktime Enforcement"\n        require(tx.time >= 0);\n        // Cancel the redemption by setting effectiveRedemptionAmount to 0\n        // In this case no collateral is redeemed from the loan and no debt is repaid\n        effectiveRedemptionAmount = 0;\n      } else {\n        // Otherwise, proceed with the normal finalization of the redemption\n        // Enforce redemption timelock on redemption Utxo\n        int sequenceRedemptionInput = tx.inputs[3].sequenceNumber;\n        require(sequenceRedemptionInput == timelockRedemption);\n      }\n\n      // Read state from redemption sidecar\n      bytes redemptionPriceBytes = tx.inputs[4].nftCommitment.split(20)[1];\n      int redemptionPrice = int(redemptionPriceBytes);\n\n      // Calculate new loan collateral after redemption\n      // Use the effectiveRedemptionAmount which is 0 if the redemption is cancelled\n      int redeemedCollateral = effectiveRedemptionAmount * 100_000_000 / redemptionPrice;\n      int newLoanCollateral = tx.inputs[0].value - redeemedCollateral;\n\n      // Parse loan state, used to construct new loan commitment\n      bytes loanState = tx.inputs[0].nftCommitment;\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\n      require(identifier == 0x01);\n      bytes6 amountBeingRedeemed, bytes lastPartLoanState = remainingPartLoanState.split(6);\n\n      // Construct loan state after redemption (update debt and amountBeingRedeemed)\n      // the new state for amountBeingRedeemed is reduced by the pendingRedemptionAmount\n      int newAmountBeingRedeemed = int(amountBeingRedeemed) - pendingRedemptionAmount;\n      // the state for the new borrowedAmount is reduced by the effectiveRedemptionAmount\n      // thus if the redemption is cancelled, the borrowedAmount remains unchanged\n      int newBorrowAmount = int(borrowedAmountBytes) - effectiveRedemptionAmount;\n      bytes27 newLoanCommitment = 0x01 + bytes6(newBorrowAmount) + bytes6(newAmountBeingRedeemed) + bytes14(lastPartLoanState);\n\n      // Recreate loan contract with new state and new collateral amount at output index 0\n      require(tx.outputs[0].nftCommitment == newLoanCommitment);\n      require(tx.outputs[0].value == newLoanCollateral);\n      require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n      require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);\n      require(tx.outputs[0].tokenAmount == 0);\n      \n      // Recreate functionContract at output index 2\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\n      require(tx.outputs[2].value == 1000);\n      require(tx.outputs[2].tokenAmount == 0);\n\n      // Burn redeemed ParyonUSD by sending to unspendable opreturn output at index 3\n      require(tx.outputs[3].lockingBytecode == new LockingBytecodeNullData([0x]));\n      if(effectiveRedemptionAmount > 0){\n        require(tx.outputs[3].tokenCategory == paryonTokenId);\n        require(tx.outputs[3].tokenAmount == effectiveRedemptionAmount);\n      } else {\n        require(tx.outputs[3].tokenCategory == 0x);\n      }\n\n      // Logic for creating the redemption payout output and redemption token change is enforced by the redemption contract\n    }\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce78517e8853ce7b517e8853cf01207f817651ce537a8800cf01127f755e7f7781c2529d8b557a7c567a9593c5a1c5040065cd1d9f9a6300b16d006753cb7655799d756854cf01147f7781780400e1f505957c9600c67c9400cf577f7c517f7c51887c567f7c81557a947b81547994517c56807e7c56807e7c7e00d28800cc9d00cd00c78800d100ce8800d3009d52cd52c78852d252cf8852d152ce8852cc02e8039d52d3009d53cd016a00827c7e7e887600a06353d152798853d3789d6753d10088686d7551',
    sourceMap: '29:14:29:35;:39::40;:6::42:1;30:38:30:59:0;:28::74:1;33:24:33:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;36:24:36:25:0;:14::40:1;:44::61:0;:64::68;:44:::1;:6::70;39:66:39:67:0;:56::82:1;:89::91:0;:56::92:1;41:36:41:62;46:38:46:61:0;49:24:49:25;:14::40:1;:44::54:0;;:6::56:1;52:53:52:54:0;:43::69:1;:79::81:0;:43::82:1;;:76::78:0;:43::82:1;;53:30:53:62;56:14:56:24:0;:28::29;:6::31:1;60:22:60:43;61:33:61:49:0;;:52::61;:64::82;;:52:::1;:33;63:27:63:38:0;:::62:1;:66::77:0;:80::91;:66:::1;:27;66:23:72:7:0;68:27:68:28;:8::30:1;::71:38;71;72:13:77:7:0;75:48:75:49;:38::65:1;76:16:76:39:0;:43::61;;:8::63:1;72:13:77:7;;80:45:80:46:0;:35::61:1;:68::70:0;:35::71:1;:::74;81:28:81:53;85:31:85:56:0;:59::70;:31:::1;:73::88:0;:31:::1;86:40:86:41:0;:30::48:1;:51::69:0;:30:::1;89:34:89:35:0;:24::50:1;90:80:90:81:0;:64::82:1;91:52:91:70:0;:77::78;:52::79:1;92:14:92:24:0;:28::32;:6::34:1;93:60:93:82:0;:89::90;:60::91:1;97:39:97:58:0;:35::59:1;:62::85:0;;:35:::1;100:32:100:51:0;:28::52:1;:55::80:0;;:28:::1;101:34:101:38:0;:48::63;:41::64:1;;:34;:74::96:0;:67::97:1;;:34;:108::125:0;:34::126:1;104:25:104:26:0;:14::41:1;:6::64;105:25:105:26:0;:14::33:1;:6::56;106:25:106:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;107:25:107:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;108:25:108:26:0;:14::39:1;:43::44:0;:6::46:1;111:25:111:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;112:25:112:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;113:25:113:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;114:25:114:26:0;:14::33:1;:37::41:0;:6::43:1;115:25:115:26:0;:14::39:1;:43::44:0;:6::46:1;118:25:118:26:0;:14::43:1;:47::80:0;:76::78;::::1;;;;:6::82;119:9:119:34:0;:37::38;:9:::1;:39:122:7:0;120:27:120:28;:16::43:1;:47::60:0;;:8::62:1;121:27:121:28:0;:16::41:1;:45::70:0;:8::72:1;122:13:124:7:0;123:27:123:28;:16::43:1;:47::49:0;:8::51:1;122:13:124:7;27:4:127:5;;',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 29,
      },
      {
        ip: 14,
        line: 33,
      },
      {
        ip: 20,
        line: 36,
      },
      {
        ip: 31,
        line: 49,
      },
      {
        ip: 43,
        line: 56,
      },
      {
        ip: 60,
        line: 68,
      },
      {
        ip: 69,
        line: 76,
      },
      {
        ip: 96,
        line: 92,
      },
      {
        ip: 123,
        line: 104,
      },
      {
        ip: 126,
        line: 105,
      },
      {
        ip: 131,
        line: 106,
      },
      {
        ip: 136,
        line: 107,
      },
      {
        ip: 140,
        line: 108,
      },
      {
        ip: 145,
        line: 111,
      },
      {
        ip: 150,
        line: 112,
      },
      {
        ip: 155,
        line: 113,
      },
      {
        ip: 159,
        line: 114,
      },
      {
        ip: 163,
        line: 115,
      },
      {
        ip: 172,
        line: 118,
      },
      {
        ip: 181,
        line: 120,
      },
      {
        ip: 185,
        line: 121,
      },
      {
        ip: 190,
        line: 123,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:25.982Z',
} as const;
