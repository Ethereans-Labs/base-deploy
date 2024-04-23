var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');

module.exports = async function run() {
    console.log('Deploying Presto UniV3');

    var PrestoUniV3 = await compile('@ethereansos/covenants-core/contracts/presto/PrestoUniV3');
    var prestoUniV3 = await deployContract(new web3.eth.Contract(PrestoUniV3.abi), PrestoUniV3.bin, [VOID_ETHEREUM_ADDRESS, 0, web3.currentProvider.knowledgeBase.AMM_AGGREGATOR, web3.currentProvider.knowledgeBase.UNISWAP_V3_SWAP_ROUTER_ADDRESS], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.PRESTO_ADDRESS = prestoUniV3.options.address;

    console.log("Presto UniV3", web3.currentProvider.knowledgeBase.PRESTO_ADDRESS);
}