var fs = require('fs');
var path = require('path');

var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');
var keccak = require('keccak');

async function generateFarmingFactoryBytecode() {

    console.log("Deploying Farming model");

    var FarmMainRegularMinStake = await compile("@ethereansos/covenants-core/contracts/farming/FarmMainRegularMinStake", "FarmMainRegularMinStake", "0.7.6");
    var farmMainRegularMinStake = await deployContract(new web3.eth.Contract(FarmMainRegularMinStake.abi), FarmMainRegularMinStake.bin, [], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.models.FarmMainRegularMinStake = farmMainRegularMinStake.options.address;
    var modelAddress = web3.currentProvider.knowledgeBase.models.FarmMainRegularMinStake;

    console.log("Deploying Farming Extension model");

    var FarmExtension = await compile("@ethereansos/covenants-core/contracts/farming/FarmExtension", "FarmExtension", "0.7.6");
    var farmExtension = await deployContract(new web3.eth.Contract(FarmExtension.abi), FarmExtension.bin, [], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.models.FarmExtension = farmExtension.options.address;

    console.log("Generating Farming Factory Bytecode");
    var organizationFactoryLazyInitData = {
        feePercentageForTransacted: feePercentage,
        feeReceiver: feeReceiver,
        tokenToTransferOrBurnAddressInCreation: VOID_ETHEREUM_ADDRESS,
        transferOrBurnAmountInCreation: "0",
        transferOrBurnReceiverInCreation: VOID_ETHEREUM_ADDRESS,
        tokenToTransferOrBurnAddressInApplication: VOID_ETHEREUM_ADDRESS,
        transferOrBurnAmountInApplication: "0",
        transferOrBurnReceiverInApplication: VOID_ETHEREUM_ADDRESS,
        factoryLazyInitData: abi.encode(["address", "address"], [web3.currentProvider.knowledgeBase.models.FarmExtension, web3.currentProvider.knowledgeBase.UNISWAP_V3_NONFUNGIBLE_POSITION_MANAGER])
    }

    var data = abi.encode(["tuple(uint256,address,address,uint256,address,address,uint256,address,bytes)"], [Object.values(organizationFactoryLazyInitData)]);
    data = abi.encode(["address", "bytes"], [modelAddress, data]);
    data = abi.encode(["string", "address", "bytes"], [web3.currentProvider.knowledgeBase.farmingFactoryUri, web3.currentProvider.knowledgeBase.DYNAMIC_URI_RESOLVER, data]);
    data = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, data]);

    var Creator = await compile('@ethereansos/swissknife/contracts/lib/Creator');
    var path1 = Creator.ast.absolutePath + ":" + Creator.name;
    var key1 = '__$' + keccak('keccak256').update(path1).digest().toString('hex').slice(0, 34) + '$__';

    var Initializer = await compile('@ethereansos/swissknife/contracts/lib/Initializer');
    var path2 = Initializer.ast.absolutePath + ":" + Initializer.name;
    var key2 = '__$' + keccak('keccak256').update(path2).digest().toString('hex').slice(0, 34) + '$__';

    var Factory = await compile('@ethereansos/ethcomputationalorgs/contracts/environment/optimism/ethereans/factories/impl/FarmingMinStakeUniV3Factory');
    Factory.bin = Factory.bin.split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2)).split(key2).join(web3.currentProvider.knowledgeBase.Initializer.substring(2));
    var factoryBytecode = new web3.eth.Contract(Factory.abi).deploy({ data: Factory.bin, arguments: [data] }).encodeABI();

    return factoryBytecode;
}

async function generateFixedInflationFactoryBytecode() {
    console.log("Deploying Fixed Inflation model");

    var FixedInflationUniV3 = await compile("@ethereansos/covenants-core/contracts/fixed-inflation/FixedInflationUniV3", "FixedInflationUniV3", "0.7.6");
    var fixedInflationUniV3 = await deployContract(new web3.eth.Contract(FixedInflationUniV3.abi), FixedInflationUniV3.bin, [], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.models.FixedInflationUniV3 = fixedInflationUniV3.options.address;
    var modelAddress = web3.currentProvider.knowledgeBase.models.FixedInflationUniV3;

    console.log("Deploying Fixed Inflation Extension model");

    var FixedInflationExtension = await compile("@ethereansos/covenants-core/contracts/fixed-inflation/FixedInflationExtension", "FixedInflationExtension", "0.7.6");
    var fixedInflationExtension = await deployContract(new web3.eth.Contract(FixedInflationExtension.abi), FixedInflationExtension.bin, [], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.models.FixedInflationExtension = fixedInflationExtension.options.address;

    console.log("Generating Fixed Inflation Factory Bytecode");
    var organizationFactoryLazyInitData = {
        feePercentageForTransacted: feePercentage,
        feeReceiver: feeReceiver,
        tokenToTransferOrBurnAddressInCreation: VOID_ETHEREUM_ADDRESS,
        transferOrBurnAmountInCreation: "0",
        transferOrBurnReceiverInCreation: VOID_ETHEREUM_ADDRESS,
        tokenToTransferOrBurnAddressInApplication: VOID_ETHEREUM_ADDRESS,
        transferOrBurnAmountInApplication: "0",
        transferOrBurnReceiverInApplication: VOID_ETHEREUM_ADDRESS,
        factoryLazyInitData: abi.encode(["address", "address"], [web3.currentProvider.knowledgeBase.models.FixedInflationExtension, web3.currentProvider.knowledgeBase.UNISWAP_V3_SWAP_ROUTER_ADDRESS])
    }

    var data = abi.encode(["tuple(uint256,address,address,uint256,address,address,uint256,address,bytes)"], [Object.values(organizationFactoryLazyInitData)]);
    data = abi.encode(["address", "bytes"], [modelAddress, data]);
    data = abi.encode(["string", "address", "bytes"], [web3.currentProvider.knowledgeBase.farmingFactoryUri, web3.currentProvider.knowledgeBase.DYNAMIC_URI_RESOLVER, data]);
    data = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, data]);

    var Creator = await compile('@ethereansos/swissknife/contracts/lib/Creator');
    var path1 = Creator.ast.absolutePath + ":" + Creator.name;
    var key1 = '__$' + keccak('keccak256').update(path1).digest().toString('hex').slice(0, 34) + '$__';

    var Initializer = await compile('@ethereansos/swissknife/contracts/lib/Initializer');
    var path2 = Initializer.ast.absolutePath + ":" + Initializer.name;
    var key2 = '__$' + keccak('keccak256').update(path2).digest().toString('hex').slice(0, 34) + '$__';

    var Factory = await compile('@ethereansos/ethcomputationalorgs/contracts/environment/optimism/ethereans/factories/impl/FixedInflationFactory');
    Factory.bin = Factory.bin.split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2)).split(key2).join(web3.currentProvider.knowledgeBase.Initializer.substring(2));
    var factoryBytecode = new web3.eth.Contract(Factory.abi).deploy({ data: Factory.bin, arguments: [data] }).encodeABI();

    return factoryBytecode;
}

var feePercentage;
var feeReceiver;
var burnPercentage;

module.exports = async function run() {
    console.log('Deploying FACTORY OF FACTORIES');

    feePercentage = numberToString(0.0008*1e18);
    feeReceiver = web3.currentProvider.knowledgeBase.COLONY_L2_ADDRESS;
    burnPercentage = "0";

    var FactoryOfFactories = await compile('@ethereansos/ethcomputationalorgs/contracts/environment/optimism/ethereans/factoryOfFactories/impl/FactoryOfFactories');
    var factoryOfFactories = new web3.eth.Contract(FactoryOfFactories.abi);

    var deployParams = abi.encode(
        ["address[]", "bytes[][]"],
        [
            [],
            []
        ]
    );
    deployParams = abi.encode(["address", "bytes"], [VOID_ETHEREUM_ADDRESS, deployParams])
    deployParams = abi.encode(["uint256", "uint256", "uint256", "bytes"], [feePercentage, feeReceiver, burnPercentage, deployParams])
    deployParams = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, deployParams])

    var contract = await deployContract(factoryOfFactories, FactoryOfFactories.bin, [deployParams], {from : web3.currentProvider.knowledgeBase.from});

    web3.currentProvider.knowledgeBase.FACTORY_OF_FACTORIES = contract.options.address;

    var factoryBytecode = await generateFarmingFactoryBytecode();
    console.log("Deploying Farming Factory");
    await blockchainCall(contract.methods.create, [web3.currentProvider.knowledgeBase.fromAddress], [[factoryBytecode]], { from : web3.currentProvider.knowledgeBase.from });

    factoryBytecode = await generateFixedInflationFactoryBytecode();
    console.log("Deploying Fixed Inflation Factory");
    await blockchainCall(contract.methods.create, [web3.currentProvider.knowledgeBase.fromAddress], [[factoryBytecode]], { from : web3.currentProvider.knowledgeBase.from });

    web3.currentProvider.knowledgeBase.factoryIndices = {
        farming : "0",
        fixedInflation : "1"
    };
    web3.currentProvider.knowledgeBase.FARMING_FACTORY = (await blockchainCall(contract.methods.get, 0))[1][0]
    web3.currentProvider.knowledgeBase.FIXED_INFLATION_FACTORY = (await blockchainCall(contract.methods.get, 1))[1][0]

    console.log("\n -> FOF", contract.options.address, "\n");
    console.log(" -> Farming Factory (0)", web3.currentProvider.knowledgeBase.FARMING_FACTORY, "\n");
    console.log(" -> FixedInflation Factory (1)", web3.currentProvider.knowledgeBase.FIXED_INFLATION_FACTORY, "\n");
}