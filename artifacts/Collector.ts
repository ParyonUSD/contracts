export default {
  contractName: 'Collector',
  constructorInputs: [
    {
      name: 'paryonTokenId',
      type: 'bytes32',
    },
    {
      name: 'lockingBytecodeProtocolFee',
      type: 'bytes',
    },
  ],
  abi: [
    {
      name: 'collect',
      inputs: [],
    },
    {
      name: 'payToStabilityPool',
      inputs: [],
    },
  ],
  bytecode: 'OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_4 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT OP_7 OP_EQUALVERIFY OP_1 OP_UTXOVALUE OP_1 OP_OUTPUTVALUE OP_SUB dc05 OP_SUB OP_4 OP_UTXOVALUE OP_ADD OP_4 OP_OUTPUTBYTECODE OP_4 OP_UTXOBYTECODE OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCOMMITMENT OP_4 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_4 OP_OUTPUTVALUE OP_NUMEQUAL OP_NIP OP_NIP OP_ELSE OP_ROT OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_UTXOTOKENCOMMITMENT OP_3 OP_EQUALVERIFY OP_3 OP_UTXOVALUE OP_3 OP_SWAP OP_MUL OP_10 OP_DIV e803 OP_MAX OP_4 OP_OUTPUTVALUE OP_NUMEQUALVERIFY OP_4 OP_OUTPUTBYTECODE OP_ROT OP_EQUAL OP_NIP OP_ENDIF',
  source: 'pragma cashscript ^0.12.0;\n\n// Collector contract for stability pool\n// The Collector contract collects interest paid from loans and finally pays it forward to the StabilityPool\n\n// Collector state does not mutate, instead the mutable capability is used to distinguish from StabilityPool receipts\n/*  --- State Mutable NFT ---\n    bytes4 periodCollector\n*/\n\ncontract Collector(\n  bytes32 paryonTokenId,\n  bytes lockingBytecodeProtocolFee\n) {\n  // function collect\n  // Receives the interest (BCH) paid from loans.\n  //\n  // Inputs: 00-PriceContract, 01-loan, 02-loanTokenSidecar, 03-payInterest, 04-collector\n  // Outputs: 00-PriceContract, 01-loan, 02-loanTokenSidecar, 03-payInterest, 04-collector\n\n  function collect() {\n    // Require contract to be at inputIndex 4\n    require(this.activeInputIndex == 4);\n\n    // Authenticate PriceContract at inputIndex 0\n    require(tx.inputs[0].tokenCategory == paryonTokenId + 0x01);\n    require(tx.inputs[0].nftCommitment.split(1)[0] == 0x00);\n\n    // Authenticate Loan at inputIndex 1\n    require(tx.inputs[1].tokenCategory == paryonTokenId + 0x01);\n    require(tx.inputs[1].nftCommitment.split(1)[0] == 0x01);\n\n    // Authenticate loan functionContract at inputIndex 3\n    require(tx.inputs[3].tokenCategory == paryonTokenId);\n    require(tx.inputs[3].nftCommitment == 0x07);\n\n    // The interest payment calculation happens in the payInterest functionContract\n    // Get the new Collector value from introspected loan collateral difference\n    // The difference in BCH between old and new loan collateral (minus 1500 sats fee) is the interest paid\n    int oldLoanCollateral = tx.inputs[1].value;\n    int newLoanCollateral = tx.outputs[1].value;\n    int interestPaid = oldLoanCollateral - newLoanCollateral - 1500;\n    int newCollectorValue = tx.inputs[4].value + interestPaid;\n      \n    // Replicate Collector contract at outputIndex4 with increased BCH holdings\n    require(tx.outputs[4].lockingBytecode == tx.inputs[4].lockingBytecode);\n    require(tx.outputs[4].nftCommitment == tx.inputs[4].nftCommitment);\n    require(tx.outputs[4].tokenCategory == tx.inputs[4].tokenCategory);\n    require(tx.outputs[4].value == newCollectorValue);\n  }\n\n  // function payToStabilityPool\n  // Pay interest collected by the Collector forward to the StabilityPool\n  // StabilityPool pays for the transaction fees if possible (normally no external fee input required).\n  //\n  // Inputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-NewPeriodPool, 03-collector, ?04-feeBch\n  // Outputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-NewPeriodPool, 03-newCollector, 04-protocolFee, 05?-newPayout, ?06-BchChange\n\n  function payToStabilityPool() {\n    // Require function to be at inputIndex 3\n    require(this.activeInputIndex== 3);\n    bytes32 stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory.split(32)[0];\n      \n    // Authenticate stabilityPool at inputIndex 0 with minting NFT\n    require(tx.inputs[0].tokenCategory == stabilityPoolTokenId + 0x02);\n\n    // Authenticate pool functionContract at inputIndex 2\n    require(tx.inputs[2].tokenCategory == stabilityPoolTokenId);\n    require(tx.inputs[2].nftCommitment == 0x03);\n\n    // Calculate 30% of collectedInterest for protocol fee\n    // Clamped to a minimum of 1000 sats\n    int collectedInterest = tx.inputs[3].value;\n    int feeAmount = (3 * collectedInterest) / 10;\n    int clampedFeeAmount = max(feeAmount, 1000);\n\n    // Add protocol fee output at outputIndex 4\n    require(tx.outputs[4].value == clampedFeeAmount);\n    require(tx.outputs[4].lockingBytecode == lockingBytecodeProtocolFee);\n  }\n}',
  debug: {
    bytecode: '5279009c63c0549d00ce78517e8800cf517f7501008851ce78517e8851cf517f75518853ce8853cf578851c651cc9402dc059454c69354cd54c78854d254cf8854d154ce8854cc9c7777677b519dc0539dc0ce01207f7500ce78527e8852ce8852cf538853c6537c955a9602e803a454cc9d54cd7b877768',
    sourceMap: '21:2:50:3;;;;;23:12:23:33;:37::38;:4::40:1;26:22:26:23:0;:12::38:1;:42::55:0;:58::62;:42:::1;:4::64;27:22:27:23:0;:12::38:1;:45::46:0;:12::47:1;:::50;:54::58:0;:4::60:1;30:22:30:23:0;:12::38:1;:42::55:0;:58::62;:42:::1;:4::64;31:22:31:23:0;:12::38:1;:45::46:0;:12::47:1;:::50;:54::58:0;:4::60:1;34:22:34:23:0;:12::38:1;:4::57;35:22:35:23:0;:12::38:1;:42::46:0;:4::48:1;40:38:40:39:0;:28::46:1;41:39:41:40:0;:28::47:1;42:23:42:60;:63::67:0;:23:::1;43:38:43:39:0;:28::46:1;:::61;46:23:46:24:0;:12::41:1;:55::56:0;:45::73:1;:4::75;47:23:47:24:0;:12::39:1;:53::54:0;:43::69:1;:4::71;48:23:48:24:0;:12::39:1;:53::54:0;:43::69:1;:4::71;49:23:49:24:0;:12::31:1;:4::54;21:2:50:3;;;59::80::0;;;61:12:61:33;:36::37;:4::39:1;62:45:62:66:0;:35::81:1;:88::90:0;:35::91:1;:::94;65:22:65:23:0;:12::38:1;:42::62:0;:65::69;:42:::1;:4::71;68:22:68:23:0;:12::38:1;:4::64;69:22:69:23:0;:12::38:1;:42::46:0;:4::48:1;73:38:73:39:0;:28::46:1;74:21:74:22:0;:25::42;:21:::1;:46::48:0;:20:::1;75:42:75:46:0;:27::47:1;78:23:78:24:0;:12::31:1;:4::53;79:23:79:24:0;:12::41:1;:45::71:0;:4::73:1;59:2:80:3;11:0:81:1',
    logs: [],
    requires: [
      {
        ip: 9,
        line: 23,
      },
      {
        ip: 15,
        line: 26,
      },
      {
        ip: 22,
        line: 27,
      },
      {
        ip: 28,
        line: 30,
      },
      {
        ip: 35,
        line: 31,
      },
      {
        ip: 38,
        line: 34,
      },
      {
        ip: 42,
        line: 35,
      },
      {
        ip: 57,
        line: 46,
      },
      {
        ip: 62,
        line: 47,
      },
      {
        ip: 67,
        line: 48,
      },
      {
        ip: 71,
        line: 49,
      },
      {
        ip: 79,
        line: 61,
      },
      {
        ip: 90,
        line: 65,
      },
      {
        ip: 93,
        line: 68,
      },
      {
        ip: 97,
        line: 69,
      },
      {
        ip: 109,
        line: 78,
      },
      {
        ip: 114,
        line: 79,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:27.904Z',
} as const;
