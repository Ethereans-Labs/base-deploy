var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');

module.exports = async function run() {
    console.log('Deploying AMM Aggregator');

    var AMMAggregator = await compile('@ethereansos/covenants-core/contracts/amm-aggregator/aggregator/AMMAggregator');
    var ammAggregator = await deployContract(new web3.eth.Contract(AMMAggregator.abi), AMMAggregator.bin, [web3.currentProvider.knowledgeBase.fromAddress, []], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.AMM_AGGREGATOR = ammAggregator.options.address;

    console.log("AMM Aggregator", web3.currentProvider.knowledgeBase.AMM_AGGREGATOR);
}