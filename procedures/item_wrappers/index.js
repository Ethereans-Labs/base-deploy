var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');
var keccak = require('keccak');

var itemProjectionFactory;
var nftDynamicUriRenderer;

async function decodeDeployedContract(transaction) {
    transaction = transaction.then ? await transaction : transaction
    var transactionReceipt = (transaction.logs && transaction) || await web3.eth.getTransactionReceipt(transaction.transactionHash || transaction);
    var log = transactionReceipt.logs.filter(it => it.topics[0] === web3Utils.sha3('Deployed(address,address,address,bytes)'))[0];
    var address = abi.decode(["address"], log.topics[2])[0];
    console.log("ProductAddress ->", address);
    return address
}

async function deployNativeModel() {
    var NativeProjection = await compile("@ethereansos/items-core/contracts/projection/native/NativeProjection");
    var nativeProjectionBytecode = new web3.eth.Contract(NativeProjection.abi).deploy({ data: NativeProjection.bin, arguments: ["0x"] }).encodeABI();
    await blockchainCall(itemProjectionFactory.methods.addModel, nativeProjectionBytecode, {from : web3.currentProvider.knowledgeBase.from, gasLimit : '6000000'});
}

async function deployERC20WrapperSingleton() {

    var ERC20WrapperUriRenderer = await compile('@ethereansos/items-core/contracts/projection/ERC20/ERC20WrapperUriRenderer');
    var erc20WrapperUriRenderer = await deployContract(new web3.eth.Contract(ERC20WrapperUriRenderer.abi), ERC20WrapperUriRenderer.bin, [web3.currentProvider.knowledgeBase.fromAddress, "myUri"], {from : web3.currentProvider.knowledgeBase.from});
    var uri = web3.eth.abi.encodeParameters(["address", "bytes"], [erc20WrapperUriRenderer.options.address, "0x"]);

    var header = {
        host: VOID_ETHEREUM_ADDRESS,
        name: "ERC20Wrapper",
        symbol: "W20",
        uri
    };

    var deployParam = abi.encode(
        [
            "bytes32",
            "tuple(address,string,string,string)",
            "tuple(tuple(address,string,string,string),bytes32,uint256,address[],uint256[])[]",
            "bytes"
        ], [
            VOID_BYTES32,
            Object.values(header),
            [],
            "0x"
        ]
    );

    deployParam = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, deployParam]);

    var ERC20Wrapper = await compile("@ethereansos/items-core/contracts/projection/ERC20/ERC20Wrapper");
    var erc20WrapperDeployData = await new web3.eth.Contract(ERC20Wrapper.abi).deploy({ data: ERC20Wrapper.bin, arguments: ["0x"] }).encodeABI();
    return await decodeDeployedContract(blockchainCall(itemProjectionFactory.methods.deploySingleton, erc20WrapperDeployData, deployParam, {from : web3.currentProvider.knowledgeBase.from}));
}


async function deployERC721WrapperSingleton() {

    var NFTDynamicUriRenderer = await compile('@ethereansos/items-core/contracts/util/NFTDynamicUriRenderer');
    nftDynamicUriRenderer = await deployContract(new web3.eth.Contract(NFTDynamicUriRenderer.abi), NFTDynamicUriRenderer.bin, [web3.currentProvider.knowledgeBase.fromAddress, "myUri"], {from : web3.currentProvider.knowledgeBase.from});
    var uri = web3.eth.abi.encodeParameters(["address", "bytes"], [nftDynamicUriRenderer.options.address, "0x"]);

    var header = {
        host: VOID_ETHEREUM_ADDRESS,
        name: "ERC721Wrapper",
        symbol: "W721",
        uri
    };

    var deployParam = abi.encode(
        [
            "bytes32",
            "tuple(address,string,string,string)",
            "tuple(tuple(address,string,string,string),bytes32,uint256,address[],uint256[])[]",
            "bytes"
        ], [
            VOID_BYTES32,
            Object.values(header),
            [],
            "0x"
        ]
    );

    deployParam = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, deployParam]);

    var ERC721Wrapper = await compile("@ethereansos/items-core/contracts/projection/ERC721/ERC721Wrapper");
    var erc721WrapperDeployData = await new web3.eth.Contract(ERC721Wrapper.abi).deploy({ data: ERC721Wrapper.bin, arguments: ["0x"] }).encodeABI();
    return await decodeDeployedContract(blockchainCall(itemProjectionFactory.methods.deploySingleton, erc721WrapperDeployData, deployParam, {from : web3.currentProvider.knowledgeBase.from}));
}

async function deployERC1155WrapperSingleton() {

    var uri = web3.eth.abi.encodeParameters(["address", "bytes"], [nftDynamicUriRenderer.options.address, "0x"]);

    var header = {
        host: VOID_ETHEREUM_ADDRESS,
        name: "ERC1155Wrapper",
        symbol: "W1155",
        uri
    };

    var deployParam = abi.encode(
        [
            "bytes32",
            "tuple(address,string,string,string)",
            "tuple(tuple(address,string,string,string),bytes32,uint256,address[],uint256[])[]",
            "bytes"
        ], [
            VOID_BYTES32,
            Object.values(header),
            [],
            "0x"
        ]
    );

    deployParam = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, deployParam]);

    var ERC1155Wrapper = await compile("@ethereansos/items-core/contracts/projection/ERC1155/ERC1155Wrapper");
    var erc1155WrapperDeploy = await new web3.eth.Contract(ERC1155Wrapper.abi).deploy({ data: ERC1155Wrapper.bin, arguments: ["0x"] }).encodeABI();
    return await decodeDeployedContract(blockchainCall(itemProjectionFactory.methods.deploySingleton, erc1155WrapperDeploy, deployParam, {from : web3.currentProvider.knowledgeBase.from}));
}

async function deployERC721DeckWrapperSingleton() {

    var uri = web3.eth.abi.encodeParameters(["address", "bytes"], [nftDynamicUriRenderer.options.address, "0x"]);

    var header = {
        host: VOID_ETHEREUM_ADDRESS,
        name: "ERC721Wrapper",
        symbol: "W721",
        uri
    };

    var deployParam = abi.encode(
        [
            "bytes32",
            "tuple(address,string,string,string)",
            "tuple(tuple(address,string,string,string),bytes32,uint256,address[],uint256[])[]",
            "bytes"
        ], [
            VOID_BYTES32,
            Object.values(header),
            [],
            abi.encode(["uint256"], [web3.currentProvider.knowledgeBase.reserveTimeInBlocks])
        ]
    );

    deployParam = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, deployParam]);

    var ERC721Wrapper = await compile("@ethereansos/items-core/contracts/environment/optimism/projection/ERC721Deck/ERC721DeckWrapper");
    var erc721WrapperDeployData = await new web3.eth.Contract(ERC721Wrapper.abi).deploy({ data: ERC721Wrapper.bin, arguments: ["0x"] }).encodeABI();
    return await decodeDeployedContract(blockchainCall(itemProjectionFactory.methods.deploySingleton, erc721WrapperDeployData, deployParam, {from : web3.currentProvider.knowledgeBase.from}));
}

async function deployERC1155DeckWrapperSingleton() {

    console.log('Deploying ERC1155DeckWrapperUtilities')
    var ERC1155DeckWrapperUtilities = await compile("@ethereansos/items-core/contracts/projection/ERC1155Deck/ERC1155DeckWrapper", "ERC1155DeckWrapperUtilities");
    var eRC1155DeckWrapperUtilities = await deployContract(new web3.eth.Contract(ERC1155DeckWrapperUtilities.abi), ERC1155DeckWrapperUtilities.bin, undefined, {from : web3.currentProvider.knowledgeBase.from});

    var path = ERC1155DeckWrapperUtilities.ast.absolutePath + ":" + ERC1155DeckWrapperUtilities.name;
    var key = '__$' + keccak('keccak256').update(path).digest().toString('hex').slice(0, 34) + '$__';

    var ERC1155Wrapper = await compile("@ethereansos/items-core/contracts/environment/optimism/projection/ERC1155Deck/ERC1155DeckWrapper");
    ERC1155Wrapper.bin = ERC1155Wrapper.bin.split(key).join(eRC1155DeckWrapperUtilities.options.address.substring(2));

    var uri = web3.eth.abi.encodeParameters(["address", "bytes"], [nftDynamicUriRenderer.options.address, "0x"]);

    var header = {
        host: VOID_ETHEREUM_ADDRESS,
        name: "ERC1155Wrapper",
        symbol: "W1155",
        uri
    };

    var deployParam = abi.encode(
        [
            "bytes32",
            "tuple(address,string,string,string)",
            "tuple(tuple(address,string,string,string),bytes32,uint256,address[],uint256[])[]",
            "bytes"
        ], [
            VOID_BYTES32,
            Object.values(header),
            [],
            abi.encode(["uint256"], [web3.currentProvider.knowledgeBase.reserveTimeInBlocks])
        ]
    );

    deployParam = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, deployParam]);

    var erc1155WrapperDeploy = await new web3.eth.Contract(ERC1155Wrapper.abi).deploy({ data: ERC1155Wrapper.bin, arguments: ["0x"] }).encodeABI();
    return await decodeDeployedContract(blockchainCall(itemProjectionFactory.methods.deploySingleton, erc1155WrapperDeploy, deployParam, {from : web3.currentProvider.knowledgeBase.from}));
}

module.exports = async function run() {

    var ItemProjectionFactory = await compile('@ethereansos/items-core/contracts/projection/factory/impl/ItemProjectionFactory');
    itemProjectionFactory = new web3.eth.Contract(ItemProjectionFactory.abi, web3.currentProvider.knowledgeBase.ITEM_PROJECTION_FACTORY);

    console.log("ITEM-V2 Projections");

    console.log("Creating Native Model");
    await deployNativeModel();

    console.log("Creating ERC20 Uri Renderer and Singleton");
    web3.currentProvider.knowledgeBase.ERC20Wrapper = await deployERC20WrapperSingleton();

    console.log("Creating ERC721 Uri Renderer and Singleton");
    web3.currentProvider.knowledgeBase.ERC721Wrapper = await deployERC721WrapperSingleton();

    console.log("Creating ERC1155 Singleton");
    web3.currentProvider.knowledgeBase.ERC1155Wrapper = await deployERC1155WrapperSingleton();

    console.log("Creating ERC721 Deck Singleton");
    web3.currentProvider.knowledgeBase.ERC721DeckWrapper = await deployERC721DeckWrapperSingleton();

    console.log("Creating ERC1155 Deck Singleton");
    web3.currentProvider.knowledgeBase.ERC1155DeckWrapper = await deployERC1155DeckWrapperSingleton();

    console.log("MODELS", await blockchainCall(itemProjectionFactory.methods.models));
}