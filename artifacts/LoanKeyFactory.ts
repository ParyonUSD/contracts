export default {
  contractName: 'LoanKeyFactory',
  constructorInputs: [
    {
      name: 'loanKeyOriginEnforcerLockingScript',
      type: 'bytes',
    },
    {
      name: 'loanKeyOriginProofLockingScript',
      type: 'bytes',
    },
  ],
  abi: [
    {
      name: 'create',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_1 OP_NUMEQUALVERIFY OP_0 OP_OUTPOINTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPOINTTXHASH OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_1 OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_3 OP_OUTPUTTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_4 OP_GREATERTHAN OP_IF OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_5 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_LESSTHANOREQUAL',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// LoanKeyFactory contract, creates provably unique loankeys while allowing BCMR metadata compatibility.\r\n\r\n/*  --- Minting NFT ---\r\n    no state (0x)\r\n*/\r\n\r\ncontract LoanKeyFactory(\r\n  bytes loanKeyOriginEnforcerLockingScript,\r\n  bytes loanKeyOriginProofLockingScript\r\n){\r\n    // function create\r\n    // Create a LoanKey with LoanKeySidecar proof to be authenticated by the LoanKeyOriginEnforcer.\r\n    //\r\n    // Inputs: 00-vout0Utxo, 01-LoanKeyFactory, 02-feeBch\r\n    // Outputs: 00-authhead, 01-LoanKeyFactory, 02-LoanKeyOriginEnforcer, 03-LoanKeyOriginProof, 04?-BchChange, 05?-opreturn\r\n\r\n  function create() {\r\n    require(this.activeInputIndex == 1);\r\n\r\n    // Check for a vout0 utxo at inputIndex 0 to use for token genesis\r\n    require(tx.inputs[0].outpointIndex == 0);\r\n    bytes32 reservedTokenId = tx.inputs[0].outpointTransactionHash;\r\n\r\n    // Output 0 of a token-genesis transaction holds the authchain in the BCMR metadata standard\r\n    // Unrestricted output so the user can claim the authchain, or so the authchain can be burned\r\n    require(tx.outputs[0].tokenCategory == 0x);\r\n\r\n    // Re-Create the LoanKeyFactory at outputIndex 1\r\n    require(tx.outputs[1].lockingBytecode == tx.inputs[1].lockingBytecode);\r\n    require(tx.outputs[1].tokenCategory == tx.inputs[1].tokenCategory);\r\n    require(tx.outputs[1].value == 1000);\r\n    require(tx.outputs[1].nftCommitment == 0x);\r\n\r\n    // Create the loanKeyOriginEnforcer output at outputIndex 2\r\n    require(tx.outputs[2].tokenCategory == reservedTokenId + 0x02);\r\n    require(tx.outputs[2].nftCommitment == 0x);\r\n    require(tx.outputs[2].tokenAmount == 0);\r\n    require(tx.outputs[2].value == 1000);\r\n    require(tx.outputs[2].lockingBytecode == loanKeyOriginEnforcerLockingScript);\r\n\r\n    // Create the loanKeyOriginProof at outputIndex 3\r\n    bytes32 loanKeyFactoryTokenId = tx.inputs[1].tokenCategory.split(32)[0];\r\n    require(tx.outputs[3].tokenCategory == loanKeyFactoryTokenId);\r\n    require(tx.outputs[3].nftCommitment == 0x);\r\n    require(tx.outputs[3].value == 1000);\r\n    require(tx.outputs[3].lockingBytecode == loanKeyOriginProofLockingScript);\r\n\r\n    // Allow for extra outputs (BCH change output, opreturn output)\r\n    if (tx.outputs.length > 4) {\r\n      require(tx.outputs[4].tokenCategory == 0x);\r\n    }\r\n    if (tx.outputs.length > 5) {\r\n      require(tx.outputs[5].tokenCategory == 0x);\r\n    }\r\n\r\n    // Restrict maximum outputs to 6 total\r\n    // This is to protect the LoanKey & LoanKeyFactory minting capabilities\r\n    require(tx.outputs.length <= 6);\r\n  }\r\n}',
  debug: {
    bytecode: 'c0519d00c9009d00c800d1008851cd51c78851d151ce8851cc02e8039d51d2008852d17c527e8852d2008852d3009d52cc02e8039d52cd8851ce01207f7553d18853d2008853cc02e8039d53cd88c454a06354d1008868c455a06355d1008868c456a1',
    sourceMap: '20:12:20:33;:37::38;:4::40:1;23:22:23:23:0;:12::38:1;:42::43:0;:4::45:1;24:40:24:41:0;:30::66:1;28:23:28:24:0;:12::39:1;:43::45:0;:4::47:1;31:23:31:24:0;:12::41:1;:55::56:0;:45::73:1;:4::75;32:23:32:24:0;:12::39:1;:53::54:0;:43::69:1;:4::71;33:23:33:24:0;:12::31:1;:35::39:0;:4::41:1;34:23:34:24:0;:12::39:1;:43::45:0;:4::47:1;37:23:37:24:0;:12::39:1;:43::58:0;:61::65;:43:::1;:4::67;38:23:38:24:0;:12::39:1;:43::45:0;:4::47:1;39:23:39:24:0;:12::37:1;:41::42:0;:4::44:1;40:23:40:24:0;:12::31:1;:35::39:0;:4::41:1;41:23:41:24:0;:12::41:1;:4::81;44:46:44:47:0;:36::62:1;:69::71:0;:36::72:1;:::75;45:23:45:24:0;:12::39:1;:4::66;46:23:46:24:0;:12::39:1;:43::45:0;:4::47:1;47:23:47:24:0;:12::31:1;:35::39:0;:4::41:1;48:23:48:24:0;:12::41:1;:4::78;51:8:51:25:0;:28::29;:8:::1;:31:53:5:0;52:25:52:26;:14::41:1;:45::47:0;:6::49:1;51:31:53:5;54:8:54:25:0;:28::29;:8:::1;:31:56:5:0;55:25:55:26;:14::41:1;:45::47:0;:6::49:1;54:31:56:5;60:12:60:29:0;:33::34;:4::36:1',
    logs: [],
    requires: [
      {
        ip: 4,
        line: 20,
      },
      {
        ip: 8,
        line: 23,
      },
      {
        ip: 14,
        line: 28,
      },
      {
        ip: 19,
        line: 31,
      },
      {
        ip: 24,
        line: 32,
      },
      {
        ip: 28,
        line: 33,
      },
      {
        ip: 32,
        line: 34,
      },
      {
        ip: 38,
        line: 37,
      },
      {
        ip: 42,
        line: 38,
      },
      {
        ip: 46,
        line: 39,
      },
      {
        ip: 50,
        line: 40,
      },
      {
        ip: 53,
        line: 41,
      },
      {
        ip: 61,
        line: 45,
      },
      {
        ip: 65,
        line: 46,
      },
      {
        ip: 69,
        line: 47,
      },
      {
        ip: 72,
        line: 48,
      },
      {
        ip: 80,
        line: 52,
      },
      {
        ip: 89,
        line: 55,
      },
      {
        ip: 94,
        line: 60,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-12-09T07:06:40.961Z',
} as const;
