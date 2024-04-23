var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');

module.exports = async function run() {

    console.log("Deploying colonies L2");

    var wethAddresses = [web3.currentProvider.knowledgeBase.WETH_ADDRESS];
    var receiverResolver = web3.currentProvider.knowledgeBase.COLONY_L1_ADDRESS;
    var executorRewardPercentage = numberToString(0.005 * 1e18);

    var bytecode = "0x";
    bytecode = abi.encode(["address[]", "address", "uint256", "bytes"], [wethAddresses, receiverResolver, executorRewardPercentage, bytecode]);
    bytecode = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, bytecode]);

    var Colony = await compile('@ethereansos/ethcomputationalorgs/contracts/environment/optimism/colonies/impl/Colony');
    var colony = await deployContract(new web3.eth.Contract(Colony.abi), Colony.bin, [bytecode], { from : web3.currentProvider.knowledgeBase.from });

    web3.currentProvider.knowledgeBase.COLONY_L2_ADDRESS = colony.options.address;

    console.log("COLONY_L2_ADDRESS", web3.currentProvider.knowledgeBase.COLONY_L2_ADDRESS);

    global.wellknownAddresses = {
        ...global.wellknownAddresses,
        [web3Utils.toChecksumAddress(colony.options.address)] : 'Colony L2'
    };
}

module.exports.test = async function test() {
    if(!global.accounts || !global.l2) {
        return;
    }

    await web3.currentProvider.unlockAccounts(web3.currentProvider.knowledgeBase.fromAddress);

    var Colony = await compile('@ethereansos/ethcomputationalorgs/contracts/environment/optimism/colonies/impl/Colony', 'Colony');
    var colony = new web3.eth.Contract(Colony.abi, web3.currentProvider.knowledgeBase.COLONY_L2_ADDRESS);

    var value = numberToString(1e18);

    await sendBlockchainTransaction(web3.currentProvider, web3.currentProvider.knowledgeBase.from, colony.options.address, "0x", value);

    var WETH = await compile('@ethereansos/ethcomputationalorgs/contracts/colonies/impl/AbstractColony', 'WETH');
    var wethToken = new web3.eth.Contract(WETH.abi, web3.currentProvider.knowledgeBase.WETH_ADDRESS);

    await blockchainCall(wethToken.methods.deposit, { from : web3.currentProvider.knowledgeBase.from, value });
    await blockchainCall(wethToken.methods.transfer, colony.options.address, value, { from : web3.currentProvider.knowledgeBase.from });

    await blockchainCall(colony.methods.sendTokens, [web3.currentProvider.knowledgeBase.WETH_ADDRESS], [], accounts[9], { from : accounts[1] });

    await blockchainCall(wethToken.methods.deposit, { value });
    await blockchainCall(wethToken.methods.transfer, colony.options.address, value);

    await blockchainCall(colony.methods.sendTokens, [web3.currentProvider.knowledgeBase.WETH_ADDRESS], [], accounts[1], { from : accounts[2] });

    await sendBlockchainTransaction(web3.currentProvider, web3.currentProvider.knowledgeBase.from, colony.options.address, "0x", value);

    await blockchainCall(colony.methods.sendTokens, [VOID_ETHEREUM_ADDRESS], [], VOID_ETHEREUM_ADDRESS, { from : accounts[7] });
}