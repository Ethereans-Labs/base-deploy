var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');

module.exports = async function run() {
    var DynamicUriResolver = await compile('@ethereansos/swissknife/contracts/dynamicMetadata/impl/DynamicUriResolver');
    var dynamicUriResolver = await deployContract(new web3.eth.Contract(DynamicUriResolver.abi), DynamicUriResolver.bin, [], { from : web3.currentProvider.knowledgeBase.from });

    console.log("L2 Dynamic URI resolver", web3.currentProvider.knowledgeBase.DYNAMIC_URI_RESOLVER = dynamicUriResolver.options.address);
}