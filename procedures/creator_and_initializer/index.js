var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');
var keccak = require('keccak');

module.exports = async function run() {
    console.log('Deploying Creator and Initializer');

    var Creator = await compile('@ethereansos/swissknife/contracts/lib/Creator');
    var creator = await deployContract(new web3.eth.Contract(Creator.abi), Creator.bin, [], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.Creator = creator.options.address;

    var path1 = Creator.ast.absolutePath + ":" + Creator.name;
    var key1 = '__$' + keccak('keccak256').update(path1).digest().toString('hex').slice(0, 34) + '$__';

    var Initializer = await compile('@ethereansos/swissknife/contracts/lib/Initializer');
    Initializer.bin = Initializer.bin.split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2));
    var initializer = await deployContract(new web3.eth.Contract(Initializer.abi), Initializer.bin, [], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.Initializer = initializer.options.address;

    console.log("Creator", web3.currentProvider.knowledgeBase.Creator);
    console.log("Initializer", web3.currentProvider.knowledgeBase.Initializer);
}