var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');

async function deployItemInteroperableInterfaceModel() {
    console.log("Deploying Item Interoperable Interface Model");
    var ItemInteroperableInterface = await compile('@ethereansos/items-core/contracts/impl/ItemInteroperableInterface');
    var itemInteroperableInterfaceModel = await deployContract(new web3.eth.Contract(ItemInteroperableInterface.abi), ItemInteroperableInterface.bin, [], { from : web3.currentProvider.knowledgeBase.from });
    return itemInteroperableInterfaceModel.options.address;
}

async function deployItemMainInterfaceSupportsInterfaceImplementer() {
    console.log("Deploying Item Main Interface Supports Interface Implementer");
    var ItemMainInterfaceSupportsInterfaceImplementer = await compile('@ethereansos/items-core/contracts/impl/ItemMainInterfaceSupportsInterfaceImplementer');
    var itemMainInterfaceSupportsInterfaceImplementer = await deployContract(new web3.eth.Contract(ItemMainInterfaceSupportsInterfaceImplementer.abi), ItemMainInterfaceSupportsInterfaceImplementer.bin, [], { from : web3.currentProvider.knowledgeBase.from });
    return itemMainInterfaceSupportsInterfaceImplementer.options.address;
}

async function deployItemMainInterface() {

    var itemInteroperableInterfaceModelAddress = await deployItemInteroperableInterfaceModel();
    var itemMainInterfaceSupportsInterfaceImplementerAddress = await deployItemMainInterfaceSupportsInterfaceImplementer();

    console.log("Deploying Item Main Interface");
    var ItemMainInterface = await compile('@ethereansos/items-core/contracts/impl/ItemMainInterface');
    var itemMainInterface = await deployContract(new web3.eth.Contract(ItemMainInterface.abi), ItemMainInterface.bin, ["myUri", web3.currentProvider.knowledgeBase.DYNAMIC_URI_RESOLVER, itemInteroperableInterfaceModelAddress, itemMainInterfaceSupportsInterfaceImplementerAddress], { from : web3.currentProvider.knowledgeBase.from });

    console.log("L2 ITEM_MAININTERFACE", web3.currentProvider.knowledgeBase.ITEM_MAININTERFACE = itemMainInterface.options.address);
}

async function deployMultiOperatorHostModel() {
    console.log("Deploying Item MultiOperatorHost Model");
    var MultiOperatorHost = await compile('@ethereansos/items-core/contracts/projection/multiOperatorHost/impl/MultiOperatorHost');
    var multiOperatorHost = await deployContract(new web3.eth.Contract(MultiOperatorHost.abi), MultiOperatorHost.bin, ["0x"], { from : web3.currentProvider.knowledgeBase.from });
    console.log("Multi Operator Host Model", multiOperatorHost.options.address);
    return multiOperatorHost.options.address;
}

async function addMultiOperatorHostModel(itemProjectionFactory, multiOperatorHostDeployBytecodeSource) {
    var multiOperatorHostDeployBytecode = multiOperatorHostDeployBytecodeSource || await deployMultiOperatorHostModel();
    console.log("Adding Item MultiOperatorHost Model");
    await blockchainCall(itemProjectionFactory.methods.addModel, multiOperatorHostDeployBytecode, { from : web3.currentProvider.knowledgeBase.from });
}

async function deployProjectionFactory() {

    var multiOperatorHostModelAddress = await deployMultiOperatorHostModel();

    await deployItemMainInterface();
    console.log("Preparing Item Projection Factory Bytecode");

    var bytecode;
    bytecode = abi.encode(["address", "bytes[]"], [web3.currentProvider.knowledgeBase.ITEM_MAININTERFACE, []]);
    bytecode = abi.encode(["address", "bytes"], [VOID_ETHEREUM_ADDRESS, bytecode]);
    bytecode = abi.encode(["string", "address", "bytes"], ["myURI", web3.currentProvider.knowledgeBase.DYNAMIC_URI_RESOLVER, bytecode]);
    bytecode = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, bytecode]);

    var ItemProjectionFactory = await compile('@ethereansos/items-core/contracts/projection/factory/impl/ItemProjectionFactory');

    console.log("Deploying Item Projection Factory");
    global.boccalone = true;
    var itemProjectionFactory = await deployContract(new web3.eth.Contract(ItemProjectionFactory.abi), ItemProjectionFactory.bin, [bytecode], { from : web3.currentProvider.knowledgeBase.from});

    console.log("L2 ITEM_PROJECTION_FACTORY", web3.currentProvider.knowledgeBase.ITEM_PROJECTION_FACTORY = itemProjectionFactory.options.address);

    await addMultiOperatorHostModel(itemProjectionFactory, multiOperatorHostModelAddress);
}

module.exports = async function run() {
    await deployProjectionFactory();
}