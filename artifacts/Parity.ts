export default {
  contractName: 'Parity',
  constructorInputs: [
    {
      name: 'loanLockingScript',
      type: 'bytes',
    },
    {
      name: 'loanTokensidecarLockingScript',
      type: 'bytes',
    },
    {
      name: 'borrowingFeeLockingScript',
      type: 'bytes',
    },
    {
      name: 'loanKeyOriginEnforcerLockingScript',
      type: 'bytes',
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
      name: 'borrow',
      inputs: [
        {
          name: 'startingInterest',
          type: 'bytes2',
        },
        {
          name: 'interestManagerConfiguration',
          type: 'bytes5',
        },
      ],
    },
    {
      name: 'updatePeriodState',
      inputs: [],
    },
  ],
  bytecode: 'OP_6 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_1 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_2 OP_EQUALVERIFY OP_2 OP_UTXOBYTECODE OP_6 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_UTXOTOKENAMOUNT OP_0 OP_OUTPUTTOKENAMOUNT OP_SUB OP_DUP 1027 OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_9 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_OUTPUTVALUE OP_10 OP_MUL OP_11 OP_DIV OP_OVER OP_MUL 00e1f505 OP_DIV OP_2 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY OP_10 OP_PICK OP_SIZE OP_NIP OP_2 OP_NUMEQUALVERIFY OP_10 OP_PICK OP_BIN2NUM OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_11 OP_PICK OP_SIZE OP_NIP OP_5 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_3 OP_PICK OP_6 OP_NUM2BIN OP_CAT OP_0 OP_6 OP_NUM2BIN OP_CAT 00 OP_CAT OP_SWAP OP_CAT OP_11 OP_PICK OP_CAT OP_11 OP_ROLL OP_CAT OP_11 OP_ROLL OP_CAT OP_2 OP_OUTPUTTOKENCATEGORY OP_5 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_5 OP_ROLL OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_3 OP_PICK OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_1 OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_5 OP_ROLL OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_OVER 00e1f505 OP_MUL OP_SWAP OP_DIV 19 OP_MUL 1027 OP_DIV e803 OP_MAX OP_4 OP_OUTPUTVALUE OP_NUMEQUALVERIFY OP_4 OP_OUTPUTBYTECODE OP_4 OP_ROLL OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_ROT OP_2 OP_CAT OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_5 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_6 OP_OUTPUTTOKENCATEGORY OP_2 OP_PICK OP_EQUALVERIFY OP_6 OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_6 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_EQUALVERIFY OP_6 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_TXOUTPUTCOUNT OP_7 OP_GREATERTHAN OP_IF OP_7 OP_OUTPUTTOKENCATEGORY OP_DUP OP_0 OP_EQUAL OP_NOTIF OP_DUP 20 OP_SPLIT OP_DROP OP_2 OP_PICK OP_EQUAL OP_NOT OP_VERIFY OP_ENDIF OP_DROP OP_ENDIF OP_TXOUTPUTCOUNT OP_8 OP_GREATERTHAN OP_IF OP_8 OP_OUTPUTTOKENCATEGORY OP_DUP OP_0 OP_EQUAL OP_NOTIF OP_DUP 20 OP_SPLIT OP_DROP OP_2 OP_PICK OP_EQUAL OP_NOT OP_VERIFY OP_ENDIF OP_DROP OP_ENDIF OP_TXOUTPUTCOUNT OP_9 OP_GREATERTHAN OP_IF OP_9 OP_OUTPUTTOKENCATEGORY OP_DUP OP_0 OP_EQUAL OP_NOTIF OP_DUP 20 OP_SPLIT OP_DROP OP_2 OP_PICK OP_EQUAL OP_NOT OP_VERIFY OP_ENDIF OP_DROP OP_ENDIF OP_TXOUTPUTCOUNT OP_10 OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_6 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_BIN2NUM OP_TXLOCKTIME 0065cd1d OP_LESSTHAN OP_VERIFY OP_5 OP_PICK OP_SWAP OP_7 OP_PICK OP_MUL OP_ADD OP_6 OP_PICK OP_ADD OP_TXLOCKTIME OP_LESSTHANOREQUAL OP_VERIFY OP_TXLOCKTIME OP_5 OP_ROLL OP_SUB OP_5 OP_ROLL OP_DIV OP_4 OP_NUM2BIN OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_1 OP_GREATERTHAN OP_IF OP_1 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_2 OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ENDIF',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// Parity borrowing contract, lets users create PUSD loans by putting up BCH collateral\r\n// The borrower receives the borrowed PUSD and a loanKey NFT to manage the loan\r\n// The maximum borrow amount and protocols fees use the current exchange rate as provided by the PriceContract\r\n\r\n// Holds Fungible Token supply\r\n/*  --- Minting NFT---\r\n  bytes4 periodParity\r\n*/\r\n\r\n// minimumDebt = 100.00 ParityUSD\r\n// minimum collateral ratio = 110%\r\n// borrowing fee = 0.25% of borrowed amount\r\n\r\ncontract Parity(\r\n    bytes loanLockingScript,\r\n    bytes loanTokensidecarLockingScript,\r\n    bytes borrowingFeeLockingScript,\r\n    bytes loanKeyOriginEnforcerLockingScript,\r\n    int startBlockHeight,\r\n    int periodLengthBlocks\r\n  ) {\r\n      // function borrow\r\n      // Borrow ParityUSD with BCH as collateral. Borrower receives a loankey minting NFT with unique category to manage the loan.\r\n      //\r\n      // Inputs: 00-parity, 01-pricecontract, 02-loanKeyOriginEnforcer, 03-loanKeyOriginProof, 04-BchCollateral\r\n      // Outputs: 00-parity, 01-pricecontract, 02-loan, 03-loanTokenSidecar, 04-borrowingFeeOutput, 05-loanKey, 06-borrowedTokens, 07?-BchChange, 08?-frontendfee\r\n\r\n    function borrow(\r\n      // Note: the bytes lengths of function arguments are not automatically enforced\r\n      bytes2 startingInterest,\r\n      bytes5 interestManagerConfiguration\r\n    ) {\r\n      require(this.activeInputIndex == 0, "Parity contract must always be at input index 0");\r\n      bytes32 parityTokenId = tx.inputs[0].tokenCategory.split(32)[0];\r\n\r\n      // Authenticate pricecontract\r\n      require(tx.inputs[1].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[1].nftCommitment.split(1)[0] == 0x00);\r\n\r\n      // Use provided minting nft as loanKey & loanSidecar identifier\r\n      bytes32 loanKeyTokenId, bytes loanKeyCapability = tx.inputs[2].tokenCategory.split(32);\r\n      require(loanKeyCapability == 0x02);\r\n      require(tx.inputs[2].lockingBytecode == loanKeyOriginEnforcerLockingScript);\r\n\r\n      // Recreate contract at outputIndex0 exactly\r\n      require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate contract at output0 - invalid lockingBytecode");\r\n      require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");\r\n      require(tx.outputs[0].value == 1000, "Recreate contract at output0 - needs to hold exactly 1000 sats");\r\n      require(tx.outputs[0].nftCommitment == tx.inputs[0].nftCommitment);\r\n\r\n      // The amount borrowed is calculated through introspection, not passed explicitly\r\n      int borrowedAmount = tx.inputs[0].tokenAmount - tx.outputs[0].tokenAmount;\r\n      // Enforce borrowedAmount is atleast minimum loan debt\r\n      require(borrowedAmount >= 100_00, "Invalid borrowedAmount, needs to be at least minimumDebt");\r\n\r\n      // Read latest oracle price from pricecontract state\r\n      bytes4 oraclePriceBytes = tx.inputs[1].nftCommitment.slice(5,9);\r\n      int oraclePrice = int(oraclePriceBytes);\r\n\r\n      // Calculate maximum borrow amount\r\n      int collateral = tx.outputs[2].value;\r\n      // Collateral has to be 10% greater than maxBorrowBase\r\n      int maxBorrowBase = ((collateral * 10) / 11);\r\n      int maxBorrow = maxBorrowBase * oraclePrice / 100_000_000;\r\n      require(borrowedAmount <= maxBorrow, "Invalid borrow amount, exceeds maxBorrow");\r\n\r\n      // Validate startingInterest input & require it to be non-negative\r\n      require(startingInterest.length == 2);\r\n      require(int(startingInterest) >= 0);\r\n\r\n      // Validate interestManagerConfiguration input\r\n      // byte interestManager, bytes2 minRateManager bytes2 maxRateManager\r\n      require(interestManagerConfiguration.length == 5);\r\n\r\n      // Read periodParity from parity state\r\n      bytes parityCommitment = tx.inputs[0].nftCommitment;\r\n      // Semantic typecast so concatenation for loanCommitment can be typed as bytes27\r\n      bytes4 periodParityBytes = bytes4(parityCommitment);\r\n\r\n      // Construct loanCommitment\r\n      bytes27 loanCommitment = 0x01 + bytes6(borrowedAmount) + bytes6(0) + 0x00 + periodParityBytes + startingInterest + startingInterest + interestManagerConfiguration;\r\n\r\n      // Create loancontract output at outputIndex 2\r\n      // Output holds the BCH collateral + a Parity mutable NFT storing the loan state\r\n      require(tx.outputs[2].tokenCategory == parityTokenId + 0x01, "Invalid Loancontract output - should have same tokenCategory");\r\n      require(tx.outputs[2].nftCommitment == loanCommitment, "Invalid Loancontract output - should have correct nftCommitment");\r\n      require(tx.outputs[2].tokenAmount == 0, "Invalid Loancontract output - should not have fungible tokens");\r\n      require(tx.outputs[2].lockingBytecode == loanLockingScript, "Invalid Loancontract output - should have correct lockingBytecode");\r\n\r\n      // Create loanTokenSidecar output at outputIndex 3\r\n      require(tx.outputs[3].tokenCategory == loanKeyTokenId);\r\n      require(tx.outputs[3].nftCommitment == 0x01);\r\n      require(tx.outputs[3].tokenAmount == 0);\r\n      require(tx.outputs[3].lockingBytecode == loanTokensidecarLockingScript);\r\n      require(tx.outputs[3].value == 1000);\r\n\r\n      // Calculate borrowing fee (0.25% of the borrowed amount, paid in BCH)\r\n      int borrowedAmountBchValue = borrowedAmount * 100_000_000 / oraclePrice;\r\n      int borrowingFeeBch = borrowedAmountBchValue * 25 / 10_000;\r\n      int borrowingFeeBchClamped = max(borrowingFeeBch, 1000);\r\n\r\n      // Create borrowingFee output at outputIndex 4\r\n      require(tx.outputs[4].value == borrowingFeeBchClamped);\r\n      require(tx.outputs[4].lockingBytecode == borrowingFeeLockingScript);\r\n      require(tx.outputs[4].tokenCategory == 0x);\r\n\r\n      // Create loanKey output at outputIndex 5\r\n      require(tx.outputs[5].tokenCategory == loanKeyTokenId + 0x02);\r\n      require(tx.outputs[5].nftCommitment == 0x);\r\n      require(tx.outputs[5].tokenAmount == 0);\r\n      require(tx.outputs[5].value == 1000);\r\n\r\n      // Create borrowed tokens output at outputIndex 6\r\n      require(tx.outputs[6].tokenCategory == parityTokenId, "Invalid tokenoutput - should have same tokenCategory");\r\n      require(tx.outputs[6].tokenAmount == borrowedAmount);\r\n      require(tx.outputs[6].nftCommitment == 0x, "Invalid tokenoutput - should not have a non-zero nft commitment");\r\n      require(tx.outputs[6].value == 1000, "Invalid tokenoutput - needs to hold exactly 1000 sats");\r\n\r\n      // Allow for extra outputs (BCH change output, front-end fee output, interest manager delegation output, etc.)\r\n      // Disallow for additional outputs to hold Parity NFTs\r\n      if (tx.outputs.length > 7) {\r\n        bytes tokenCategoryOutput7 = tx.outputs[7].tokenCategory;\r\n        // If there is a tokenCategory on the output, it must not be the parityTokenId\r\n        if(tokenCategoryOutput7 != 0x) require(tokenCategoryOutput7.split(32)[0] != parityTokenId);\r\n      }\r\n      if (tx.outputs.length > 8) {\r\n        bytes tokenCategoryOutput8 = tx.outputs[8].tokenCategory;\r\n        if(tokenCategoryOutput8 != 0x) require(tokenCategoryOutput8.split(32)[0] != parityTokenId);\r\n      }\r\n       if (tx.outputs.length > 9) {\r\n        bytes tokenCategoryOutput9 = tx.outputs[9].tokenCategory;\r\n        if(tokenCategoryOutput9 != 0x) require(tokenCategoryOutput9.split(32)[0] != parityTokenId);\r\n      }\r\n      // Restrict maximum outputs to 10 total to protect minting capability\r\n      require(tx.outputs.length <= 10);\r\n    }\r\n      // function updatePeriodState\r\n      // Update the Parity contract period state to a newer period based on tx locktime\r\n      //\r\n      // Inputs: 00-parity, 01-feeBch\r\n      // Outputs: 00-parity, 01?-BchChange\r\n\r\n    function updatePeriodState() {\r\n      require(this.activeInputIndex == 0, "Parity contract must always be at input index 0");\r\n\r\n      // Read currentPeriod from parity state\r\n      bytes parityCommitment = tx.inputs[0].nftCommitment;\r\n      int currentPeriodParity = int(parityCommitment);\r\n\r\n      // Check if locktime is set correctly\r\n      // We restrict locktime to below 500 million as values above are unix timestamps instead of block heights\r\n      require(tx.locktime < 500_000_000);\r\n\r\n      // Locktime should be in new period\r\n      int startingHeightCurrentPeriod = startBlockHeight + currentPeriodParity * periodLengthBlocks;\r\n      int startingHeightNewPeriod = startingHeightCurrentPeriod + periodLengthBlocks;\r\n      require(tx.locktime >= startingHeightNewPeriod, "Locktime should be in new period");\r\n\r\n      // construct new period state\r\n      int newPeriodParity = (tx.locktime - startBlockHeight) / periodLengthBlocks;\r\n      bytes4 newPeriodParityBytes = bytes4(newPeriodParity);\r\n\r\n      // Recreate contract at outputIndex0 exactly\r\n      require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate contract at output0 - invalid lockingBytecode");\r\n      require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");\r\n      require(tx.outputs[0].value == 1000, "Recreate contract at output0 - needs to hold exactly 1000 sats");\r\n      require(tx.outputs[0].tokenAmount == tx.inputs[0].tokenAmount, "Recreate contract at output0 - invalid tokenAmount");\r\n      require(tx.outputs[0].nftCommitment == newPeriodParityBytes);\r\n\r\n      // Allow for extra BCH change output, disallow for additional output to hold any tokens\r\n      if (tx.outputs.length > 1) {\r\n        require(tx.outputs[1].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");\r\n      }\r\n      \r\n      // Restrict maximum outputs to 2 total to protect minting capability\r\n      require(tx.outputs.length <= 2);\r\n  }\r\n}',
  debug: {
    bytecode: '5679009c63c0009d00ce01207f7551ce78517e8851cf517f7501008852ce01207f528852c7567a8800cd00c78800d100ce8800cc02e8039d00d200cf8800d000d39476021027a26951cf597f75557f778152cc5a955b9678950400e1f505965279a2695a798277529d5a798100a2695b798277559d00cf51537956807e0056807e01007e7c7e5b797e5b7a7e5b7a7e52d15579517e8852d28852d3009d52cd557a8853d153798853d2518853d3009d53cd557a8853cc02e8039d780400e1f505957c960119950210279602e803a454cc9d54cd547a8854d1008855d17b527e8855d2008855d3009d55cc02e8039d56d152798856d39d56d2008856cc02e8039dc457a06357d1760087647601207f755279879169687568c458a06358d1760087647601207f755279879169687568c459a06359d1760087647601207f755279879169687568c45aa1696d6d5167567a519dc0009d00cf81c5040065cd1d9f6955797c57799593567993c5a169c5557a94557a96548000cd00c78800d100ce8800cc02e8039d00d300d09d00d288c451a06351d1008868c452a1696d6d5168',
    sourceMap: '30:4:138:5;;;;;35:14:35:35;:39::40;:6::93:1;36:40:36:41:0;:30::56:1;:63::65:0;:30::66:1;:::69;39:24:39:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;40:24:40:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;43:66:43:67:0;:56::82:1;:89::91:0;:56::92:1;44:35:44:39:0;:6::41:1;45:24:45:25:0;:14::42:1;:46::80:0;;:6::82:1;48:25:48:26:0;:14::43:1;:57::58:0;:47::75:1;:6::135;49:25:49:26:0;:14::41:1;:55::56:0;:45::71:1;:6::129;50:25:50:26:0;:14::33:1;:37::41:0;:6::109:1;51:25:51:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;54:37:54:38:0;:27::51:1;:65::66:0;:54::79:1;:27;56:14:56:28:0;:32::38;:14:::1;:6::100;59:42:59:43:0;:32::58:1;:67::68:0;:32::69:1;;:65::66:0;:32::69:1;;60:24:60:45;63:34:63:35:0;:23::42:1;65:41:65:43:0;:28:::1;:47::49:0;:27:::1;66:38:66::0;:22:::1;:52::63:0;:22:::1;67:14:67:28:0;;:::41:1;:6::87;70:14:70:30:0;;:::37:1;;:41::42:0;:6::44:1;71:18:71:34:0;;:14::35:1;:39::40:0;:14:::1;:6::42;75:14:75::0;;:::49:1;;:53::54:0;:6::56:1;78:41:78:42:0;:31::57:1;83::83:35:0;:45::59;;:38::60:1;;:31;:70::71:0;:63::72:1;;:31;:75::79:0;:31:::1;:82::99:0;:31:::1;:102::118:0;;:31:::1;:121::137:0;;:31:::1;:140::168:0;;:31:::1;87:25:87:26:0;:14::41:1;:45::58:0;;:61::65;:45:::1;:6::131;88:25:88:26:0;:14::41:1;:6::128;89:25:89:26:0;:14::39:1;:43::44:0;:6::111:1;90:25:90:26:0;:14::43:1;:47::64:0;;:6::135:1;93:25:93:26:0;:14::41:1;:45::59:0;;:6::61:1;94:25:94:26:0;:14::41:1;:45::49:0;:6::51:1;95:25:95:26:0;:14::39:1;:43::44:0;:6::46:1;96:25:96:26:0;:14::43:1;:47::76:0;;:6::78:1;97:25:97:26:0;:14::33:1;:37::41:0;:6::43:1;100:35:100:49:0;:52::63;:35:::1;:66::77:0;:35:::1;101:53:101:55:0;:28:::1;:58::64:0;:28:::1;102:56:102:60:0;:35::61:1;105:25:105:26:0;:14::33:1;:6::61;106:25:106:26:0;:14::43:1;:47::72:0;;:6::74:1;107:25:107:26:0;:14::41:1;:45::47:0;:6::49:1;110:25:110:26:0;:14::41:1;:45::59:0;:62::66;:45:::1;:6::68;111:25:111:26:0;:14::41:1;:45::47:0;:6::49:1;112:25:112:26:0;:14::39:1;:43::44:0;:6::46:1;113:25:113:26:0;:14::33:1;:37::41:0;:6::43:1;116:25:116:26:0;:14::41:1;:45::58:0;;:6::116:1;117:25:117:26:0;:14::39:1;:6::59;118:25:118:26:0;:14::41:1;:45::47:0;:6::116:1;119:25:119:26:0;:14::33:1;:37::41:0;:6::100:1;123:10:123:27:0;:30::31;:10:::1;:33:127:7:0;124:48:124:49;:37::64:1;126:11:126:31:0;:35::37;:11:::1;:::99:0;:47::67;:74::76;:47::77:1;:::80;:84::97:0;;:47:::1;;:39::99;;123:33:127:7;;128:10:128:27:0;:30::31;:10:::1;:33:131:7:0;129:48:129:49;:37::64:1;130:11:130:31:0;:35::37;:11:::1;:::99:0;:47::67;:74::76;:47::77:1;:::80;:84::97:0;;:47:::1;;:39::99;;128:33:131:7;;132:11:132:28:0;:31::32;:11:::1;:34:135:7:0;133:48:133:49;:37::64:1;134:11:134:31:0;:35::37;:11:::1;:::99:0;:47::67;:74::76;:47::77:1;:::80;:84::97:0;;:47:::1;;:39::99;;132:34:135:7;;137:14:137:31:0;:35::37;:14:::1;:6::39;30:4:138:5;;;;145::179:3:0;;;;146:14:146:35;:39::40;:6::93:1;149:41:149:42:0;:31::57:1;150:32:150:53;154:14:154:25:0;:28::39;:14:::1;:6::41;157:40:157:56:0;;:59::78;:81::99;;:59:::1;:40;158:66:158:84:0;;:36:::1;159:14:159:25:0;:::52:1;:6::90;162:29:162:40:0;:43::59;;:29:::1;:63::81:0;;:28:::1;163:36:163:59;;166:25:166:26:0;:14::43:1;:57::58:0;:47::75:1;:6::135;167:25:167:26:0;:14::41:1;:55::56:0;:45::71:1;:6::129;168:25:168:26:0;:14::33:1;:37::41:0;:6::109:1;169:25:169:26:0;:14::39:1;:53::54:0;:43::67:1;:6::123;170:25:170:26:0;:14::41:1;:6::67;173:10:173:27:0;:30::31;:10:::1;:33:175:7:0;174:27:174:28;:16::43:1;:47::49:0;:8::109:1;173:33:175:7;178:14:178:31:0;:35::36;:14:::1;:6::38;145:4:179:3;;;16:0:180:1',
    logs: [],
    requires: [
      {
        ip: 13,
        line: 35,
        message: 'Parity contract must always be at input index 0',
      },
      {
        ip: 24,
        line: 39,
      },
      {
        ip: 31,
        line: 40,
      },
      {
        ip: 37,
        line: 44,
      },
      {
        ip: 42,
        line: 45,
      },
      {
        ip: 47,
        line: 48,
        message: 'Recreate contract at output0 - invalid lockingBytecode',
      },
      {
        ip: 52,
        line: 49,
        message: 'Recreate contract at output0 - invalid tokenCategory',
      },
      {
        ip: 56,
        line: 50,
        message: 'Recreate contract at output0 - needs to hold exactly 1000 sats',
      },
      {
        ip: 61,
        line: 51,
      },
      {
        ip: 70,
        line: 56,
        message: 'Invalid borrowedAmount, needs to be at least minimumDebt',
      },
      {
        ip: 93,
        line: 67,
        message: 'Invalid borrow amount, exceeds maxBorrow',
      },
      {
        ip: 99,
        line: 70,
      },
      {
        ip: 105,
        line: 71,
      },
      {
        ip: 111,
        line: 75,
      },
      {
        ip: 143,
        line: 87,
        message: 'Invalid Loancontract output - should have same tokenCategory',
      },
      {
        ip: 146,
        line: 88,
        message: 'Invalid Loancontract output - should have correct nftCommitment',
      },
      {
        ip: 150,
        line: 89,
        message: 'Invalid Loancontract output - should not have fungible tokens',
      },
      {
        ip: 155,
        line: 90,
        message: 'Invalid Loancontract output - should have correct lockingBytecode',
      },
      {
        ip: 160,
        line: 93,
      },
      {
        ip: 164,
        line: 94,
      },
      {
        ip: 168,
        line: 95,
      },
      {
        ip: 173,
        line: 96,
      },
      {
        ip: 177,
        line: 97,
      },
      {
        ip: 191,
        line: 105,
      },
      {
        ip: 196,
        line: 106,
      },
      {
        ip: 200,
        line: 107,
      },
      {
        ip: 206,
        line: 110,
      },
      {
        ip: 210,
        line: 111,
      },
      {
        ip: 214,
        line: 112,
      },
      {
        ip: 218,
        line: 113,
      },
      {
        ip: 223,
        line: 116,
        message: 'Invalid tokenoutput - should have same tokenCategory',
      },
      {
        ip: 226,
        line: 117,
      },
      {
        ip: 230,
        line: 118,
        message: 'Invalid tokenoutput - should not have a non-zero nft commitment',
      },
      {
        ip: 234,
        line: 119,
        message: 'Invalid tokenoutput - needs to hold exactly 1000 sats',
      },
      {
        ip: 253,
        line: 126,
      },
      {
        ip: 275,
        line: 130,
      },
      {
        ip: 297,
        line: 134,
      },
      {
        ip: 304,
        line: 137,
      },
      {
        ip: 315,
        line: 146,
        message: 'Parity contract must always be at input index 0',
      },
      {
        ip: 322,
        line: 154,
      },
      {
        ip: 335,
        line: 159,
        message: 'Locktime should be in new period',
      },
      {
        ip: 349,
        line: 166,
        message: 'Recreate contract at output0 - invalid lockingBytecode',
      },
      {
        ip: 354,
        line: 167,
        message: 'Recreate contract at output0 - invalid tokenCategory',
      },
      {
        ip: 358,
        line: 168,
        message: 'Recreate contract at output0 - needs to hold exactly 1000 sats',
      },
      {
        ip: 363,
        line: 169,
        message: 'Recreate contract at output0 - invalid tokenAmount',
      },
      {
        ip: 366,
        line: 170,
      },
      {
        ip: 374,
        line: 174,
        message: 'Invalid BCH change output - should not hold any tokens',
      },
      {
        ip: 379,
        line: 178,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:38.007Z',
} as const;
