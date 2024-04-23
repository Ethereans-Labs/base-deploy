var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, compile, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');

var { attachCreatorAndInitializerHookToCompiler, getHardCabledInfoBytecode } = require('../../resources/utils');

module.exports = async function start() {

    await attachCreatorAndInitializerHookToCompiler();

    var bytecodes = await Promise.all([
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/proposals/GeneralRules", "BySpecificAddress", "BY_HOST", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/proposals/ProposalCanTerminates", "CanBeTerminatedAfter", "BY_TIME", "REAL_URI_HERE"),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/proposals/ProposalCanTerminates", "CanBeTerminatedWhenHardCapReached", "BY_HARD_CAP", "REAL_URI_HERE"),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/proposals/ProposalValidators", "ValidateQuorum", "BY_QUORUM", "REAL_URI_HERE"),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/proposals/ProposalValidators", "IsValidUntil", "UNTIL", "REAL_URI_HERE")
    ]);

    var isSingleton = bytecodes.map(_ => true);
    isSingleton[0] = false;

    var ProposalRulesFactory = await compile("@ethereansos/ethcomputationalorgs/contracts/ethereans/factories/impl/ProposalRulesFactory");

    var lazyInitData = abi.encode(["bytes[]", "bool[]"], [bytecodes, isSingleton]);
    lazyInitData = abi.encode(["address", "bytes"], [VOID_ETHEREUM_ADDRESS, lazyInitData]);
    lazyInitData = abi.encode(["string", "address", "bytes"], ["REAL_URI_HERE", web3.currentProvider.knowledgeBase.DYNAMIC_URI_RESOLVER, lazyInitData]);
    lazyInitData = abi.encode(["address", "bytes"], [VOID_ETHEREUM_ADDRESS, lazyInitData]);

    var bytecode = new web3.eth.Contract(ProposalRulesFactory.abi).deploy({data : ProposalRulesFactory.bin, arguments: [lazyInitData]}).encodeABI();

    var FactoryOfFactories = await compile('@ethereansos/ethcomputationalorgs/contracts/ethereans/factoryOfFactories/model/IFactoryOfFactories');
    var factoryOfFactories = new web3.eth.Contract(FactoryOfFactories.abi, web3.currentProvider.knowledgeBase.FACTORY_OF_FACTORIES);

    var transaction = await blockchainCall(factoryOfFactories.methods.create, [web3.currentProvider.knowledgeBase.fromAddress], [[bytecode]], {from : web3.currentProvider.knowledgeBase.from});

    var log = transaction.logs.filter(it => it.topics[0] === web3Utils.sha3('FactoryAdded(uint256,address,address,uint256)'))[0];
    web3.currentProvider.knowledgeBase.factoryIndices.proposalRules = parseInt(abi.decode(["uint256"], log.topics[1])[0].toString());
    web3.currentProvider.knowledgeBase.PROPOSAL_RULES_FACTORY = abi.decode(["address"], log.topics[3])[0].toString();

    var ProposalRulesFactory = await compile("@ethereansos/ethcomputationalorgs/contracts/ethereans/factories/impl/ProposalRulesFactory");
    var proposalRulesFactory = new web3.eth.Contract(ProposalRulesFactory.abi, web3.currentProvider.knowledgeBase.PROPOSAL_RULES_FACTORY);

    var list = (await proposalRulesFactory.methods.list().call()).addresses;

    web3.currentProvider.knowledgeBase.models.BySpecificAddress = list[0];
    web3.currentProvider.knowledgeBase.models.CanBeTerminatedAfter = list[1];
    web3.currentProvider.knowledgeBase.models.CanBeTerminatedWhenHardCapReached = list[2];
    web3.currentProvider.knowledgeBase.models.ValidateQuorum = list[3];
    web3.currentProvider.knowledgeBase.models.IsValidUntil = list[4];
};


module.exports.test = async function test() {
    var ProposalRulesFactory = await compile("@ethereansos/ethcomputationalorgs/contracts/ethereans/factories/impl/ProposalRulesFactory");
    var proposalRulesFactory = new web3.eth.Contract(ProposalRulesFactory.abi, web3.currentProvider.knowledgeBase.PROPOSAL_RULES_FACTORY);

    var list = (await proposalRulesFactory.methods.list().call()).addresses;

    var { addresses, lazyInitData } = createProposalArrays(list);

    var output = await createProposalRules(proposalRulesFactory, addresses, lazyInitData);
    assert(web3Utils.toChecksumAddress(addresses[1]) != web3Utils.toChecksumAddress(output.addresses[1]));
    assert.strictEqual(output.bytes[0], "0x");
    assert.strictEqual(output.bytes[1], "0x");

    addresses.push(output.addresses[0]);
    lazyInitData.push(lazyInitData[0]);
    await assert.catchCall(createProposalRules(proposalRulesFactory, addresses, lazyInitData), "invalid input");
    await assert.catchCall(createProposalRules(proposalRulesFactory, addresses, lazyInitData, 1), "invalid input");

    lazyInitData[lazyInitData.length - 1] = "0x";
    output = await createProposalRules(proposalRulesFactory, addresses, lazyInitData, 1);
    assert.strictEqual(addresses[addresses.length -1], output.addresses[output.addresses.length -1]);

    var initialSalt = web3Utils.sha3("Gino_paoli_" + new Date().getTime());

    var bySalt = await proposalRulesFactory.methods.bySalt(1, initialSalt).call();

    var dataCollector = bySalt[0];

    addresses[0] = dataCollector;
    await assert.catchCall(createProposalRules(proposalRulesFactory, addresses, lazyInitData, 1), "singleton");

    await assert.catchCall(proposalRulesFactory.methods.bySalt(30, initialSalt).call());

    bySalt = await proposalRulesFactory.methods.bySalt(0, initialSalt).call();

    dataCollector = bySalt[0];
    var productAddress = bySalt[1];

    addresses[0] = productAddress;
    await assert.catchCall(createProposalRules(proposalRulesFactory, addresses, lazyInitData, 1));

    addresses[0] = dataCollector;
    addresses[1] = productAddress;
    await assert.catchCall(createProposalRules(proposalRulesFactory, addresses, lazyInitData), "invalid input");
    await assert.catchCall(createProposalRules(proposalRulesFactory, addresses, lazyInitData, 1), "invalid input");

    lazyInitData[1] = "0x";
    addresses[addresses.length - 1] = productAddress;
    output = await createProposalRules(proposalRulesFactory, addresses, lazyInitData, 1);

    assert.strictEqual(output.addresses[0], productAddress);
    assert.strictEqual(output.addresses[1], productAddress);
    assert.strictEqual(output.addresses[output.addresses.length -1], productAddress);

    await assert.catchCall(createProposalRules(proposalRulesFactory, addresses, lazyInitData, 1), "creation");
};

function createProposalArrays(list) {
    var lazyInitData = [
        abi.encode(["address", "bool"], [accounts[1], false]),
        abi.encode(["address", "bool"], [accounts[2], false]),
        abi.encode(["uint256"], [350000]),
        abi.encode(["uint256", "bool"], [180, false]),
        abi.encode(["uint256", "bool"], [2, true]),
        abi.encode(["uint256", "bool"], [2, true]),
        abi.encode(["uint256"], [185000])
    ];

    var addresses = [
        0,
        list[0],
        1,
        list[2],
        3,
        list[3],
        list[4]
    ];

    addresses = addresses.map(it => typeof(it) === 'string' ? it : abi.decode(["address"], abi.encode(["uint256"], [it]))[0].toString());

    return {
        addresses,
        lazyInitData
    }
}

async function createProposalRules(proposalRulesFactory, addresses, lazyInitData, mode) {

    var deployData = !mode ? abi.encode(["address[]", "bytes[]"], [addresses, lazyInitData]) : concatenate(addresses, lazyInitData);

    deployData = abi.encode(["uint256", "bytes"], [mode || 0, deployData]);

    var transaction = await blockchainCall(proposalRulesFactory.methods.deploy, deployData, { from : web3.currentProvider.from});

    var log = transaction.logs.filter(it => it.topics[0] === web3Utils.sha3('DeployResult(address[],bytes[])'))[0];

    log = abi.decode(["address[]", "bytes[]"], log.data);

    var output = {
        addresses : log[0],
        bytes : log[1]
    };

    return output;
}

function concatenate(addresses, lazyInitDataArray) {
    var deployData = "0x";

    for(var i in addresses) {
        var address = addresses[i];
        var lazyInitData = lazyInitDataArray[i];
        deployData = abi.encode(["address", "bytes", "bytes"], [address, lazyInitData, deployData]);
    }

    return deployData;
}