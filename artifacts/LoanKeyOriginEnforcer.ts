export default {
  contractName: 'LoanKeyOriginEnforcer',
  constructorInputs: [
    {
      name: 'loanKeyFactoryTokenId',
      type: 'bytes',
    },
    {
      name: 'paryonTokenId',
      type: 'bytes',
    },
  ],
  abi: [
    {
      name: 'enforce',
      inputs: [],
    },
  ],
  bytecode: 'OP_0 OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_2 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_ROT OP_1 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_OUTPOINTTXHASH OP_2 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_3 OP_OUTPOINTINDEX OP_2 OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\n\n// LoanKeyOriginEnforcer contract, enforces prepared unique loankey is used in borrowing transaction.\n\n/*  --- Minting NFT ---\n    no state (0x)\n*/\n\ncontract LoanKeyOriginEnforcer(\n  bytes loanKeyFactoryTokenId,\n  bytes paryonTokenId\n){\n    // function enforce\n    // Enforce that the loanKey used in the borrowing transaction is created by the LoanKeyFactory.\n    //\n    // Inputs: 00-borrowing, 01-pricecontract, 02-LoanKeyOriginEnforcer, 03-LoanKeyOriginProof, 04-BchCollateral\n\n  function enforce() {\n    // Authenticate borrowing contract\n    require(tx.inputs[0].tokenCategory == paryonTokenId + 0x02);\n\n    // Authenticate price contract\n    require(tx.inputs[1].tokenCategory == paryonTokenId + 0x01);\n    require(tx.inputs[1].nftCommitment.split(1)[0] == 0x00);\n\n    // Enforce LoanKeyOriginEnforcer at inputIndex 2\n    require(this.activeInputIndex == 2);\n\n    // Authenticate LoanKeyOriginProof\n    require(tx.inputs[3].tokenCategory == loanKeyFactoryTokenId);\n    require(tx.inputs[3].outpointTransactionHash == tx.inputs[2].outpointTransactionHash);\n    require(tx.inputs[3].outpointIndex == tx.inputs[2].outpointIndex + 1);\n  }\n}',
  debug: {
    bytecode: '00ce5279527e8851ce7b517e8851cf517f75010088c0529d53ce8853c852c88853c952c98b9c',
    sourceMap: '20:22:20:23;:12::38:1;:42::55:0;;:58::62;:42:::1;:4::64;23:22:23:23:0;:12::38:1;:42::55:0;:58::62;:42:::1;:4::64;24:22:24:23:0;:12::38:1;:45::46:0;:12::47:1;:::50;:54::58:0;:4::60:1;27:12:27:33:0;:37::38;:4::40:1;30:22:30:23:0;:12::38:1;:4::65;31:22:31:23:0;:12::48:1;:62::63:0;:52::88:1;:4::90;32:22:32:23:0;:12::38:1;:52::53:0;:42::68:1;:::72;:4::74',
    logs: [],
    requires: [
      {
        ip: 8,
        line: 20,
      },
      {
        ip: 14,
        line: 23,
      },
      {
        ip: 21,
        line: 24,
      },
      {
        ip: 24,
        line: 27,
      },
      {
        ip: 27,
        line: 30,
      },
      {
        ip: 32,
        line: 31,
      },
      {
        ip: 39,
        line: 32,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2026-04-24T08:33:22.562Z',
} as const;
