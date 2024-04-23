var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');
var keccak = require('keccak');

module.exports = async function run() {
    console.log("Deploying Deck Presto");
    var DeckPresto = await compile('@ethereansos/items-core/contracts/projection/deckPresto/DeckPresto');
    var deckPresto = await deployContract(new web3.eth.Contract(DeckPresto.abi), DeckPresto.bin, [web3.currentProvider.knowledgeBase.PRESTO_ADDRESS, web3.currentProvider.knowledgeBase.ERC721DeckWrapper, web3.currentProvider.knowledgeBase.ERC1155DeckWrapper], {from : web3.currentProvider.knowledgeBase.from});

    console.log('DeckPresto ->', deckPresto.options.address);
    web3.currentProvider.knowledgeBase.deckPresto = deckPresto.options.address;
}