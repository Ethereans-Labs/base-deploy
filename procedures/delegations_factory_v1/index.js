var keccak = require('keccak');
var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, numberToString, compile, sendAsync, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');
var { attachCreatorAndInitializerHookToCompiler, getHardCabledInfoBytecode, getTokenDecimals } = require('../../resources/utils');

module.exports = async function start() {

    await attachCreatorAndInitializerHookToCompiler();

    var utilityModels = await Promise.all([
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/delegation/impl/DelegationTokensManager")
    ]);

    for(var i in utilityModels) {
        utilityModels[i] = (await sendBlockchainTransaction(web3.currentProvider, web3.currentProvider.knowledgeBase.from, null, utilityModels[i])).contractAddress;
    }
    web3.currentProvider.knowledgeBase.models.DelegationTokensManager = utilityModels[0];

    var proposalModels = await Promise.all([
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/delegation/impl/DelegationProposals", "DelegationsManagerAttacherProposal", "DELEGATION_ATTACH", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/proposals/GeneralRules", "ChangeOrganizationUriProposal", "DELEGATION_CHANGE_METADATA", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/delegation/impl/DelegationProposals", "DelegationChangeRulesProposal", "DELEGATION_CHANGE_VOTING_RULES", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/delegation/impl/DelegationProposals", "DelegationTransferManagerProposal", "DELEGATION_TRANSFER_ASSETS", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/delegation/impl/DelegationProposals", "VoteProposal", "DELEGATION_VOTE", "REAL_URI_HERE", true),
    ]);

    for(var i in proposalModels) {
        proposalModels[i] = (await sendBlockchainTransaction(web3.currentProvider, web3.currentProvider.knowledgeBase.from, null, proposalModels[i])).contractAddress;
    }
    web3.currentProvider.knowledgeBase.models.DelegationsManagerAttacherProposal = proposalModels[0];
    web3.currentProvider.knowledgeBase.models.ChangeOrganizationUriProposal = proposalModels[1];
    web3.currentProvider.knowledgeBase.models.DelegationChangeRulesProposal = proposalModels[2];
    web3.currentProvider.knowledgeBase.models.DelegationTransferManagerProposal = proposalModels[3];
    web3.currentProvider.knowledgeBase.models.VoteProposal = proposalModels[4];

    var _proposalRules = [
        web3.currentProvider.knowledgeBase.models.BySpecificAddress,
        web3.currentProvider.knowledgeBase.models.CanBeTerminatedAfter,
        web3.currentProvider.knowledgeBase.models.CanBeTerminatedWhenHardCapReached,
        web3.currentProvider.knowledgeBase.models.IsValidUntil,
        web3.currentProvider.knowledgeBase.models.ValidateQuorum
    ];

    var modelAddress = web3.currentProvider.knowledgeBase.models.SubDAO;

    var values = [
        web3.currentProvider.knowledgeBase.models.ProposalsManager,//active
        web3.currentProvider.knowledgeBase.models.TreasuryManager,
        web3.currentProvider.knowledgeBase.models.DelegationTokensManager
    ];

    var valuesKeys = [
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_PROPOSALS_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_TREASURY_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_TOKENS_MANAGER
    ];

    var actives = values.map(() => false);
    actives[0] = true;
    actives[2] = true;

    var delegationProposalModels = [
        web3.currentProvider.knowledgeBase.models.DelegationsManagerAttacherProposal,
        web3.currentProvider.knowledgeBase.models.ChangeOrganizationUriProposal,
        web3.currentProvider.knowledgeBase.models.DelegationChangeRulesProposal,
        web3.currentProvider.knowledgeBase.models.DelegationTransferManagerProposal,
        web3.currentProvider.knowledgeBase.models.VoteProposal
    ];

    var subDAOProposalModelTypes = [
        "address",
        "string",
        "bool",
        "bytes[]",
        "bytes32[]",
        "address",
        "address",
        "uint256",
        "address[][]",
        "address[][]",
        "bytes",
        "bytes",
        "bytes[][]",
        "bytes[][]"
    ];

    var subDAOProposalModels = delegationProposalModels.map(it => ({
        source : it,
        uri : "str",
        perpetual : false,
        bytes : [],
        bytes32 : [],
        a : VOID_ETHEREUM_ADDRESS,
        b : VOID_ETHEREUM_ADDRESS,
        c : 0,
        d : [[VOID_ETHEREUM_ADDRESS]],
        e : [[VOID_ETHEREUM_ADDRESS]],
        f : "0x",
        g : "0x",
        h : [["0x"]],
        i : [["0x"]]
    }));

    subDAOProposalModels[3].bytes = [abi.encode(["uint256"], [toDecimals(70 / 100, 18)])]

    var delegationFactoryBytecode = abi.encode([
        "address",
        `tuple(address,string,string,string)`,
        "uint256",
        `tuple(${subDAOProposalModelTypes.join(',')})[]`
    ], [
        web3.currentProvider.knowledgeBase.ITEM_PROJECTION_FACTORY,
        Object.values(web3.currentProvider.knowledgeBase.delegationFactoryCollectionHeader),
        web3.currentProvider.knowledgeBase.presetValues,
        subDAOProposalModels.map(it => Object.values(it))
    ]);

    delegationFactoryBytecode = abi.encode([
        "address[]",
        "address[]",
        "bytes32[]",
        "bool[]",
        "bytes"
    ], [
        _proposalRules,
        values,
        valuesKeys,
        actives,
        delegationFactoryBytecode
    ]);

    var ethereansFactoryInitializerType = [
        "uint256",
        "address",
        "address",
        "uint256",
        "address",
        "address",
        "uint256",
        "address",
        "bytes"
    ]

    var ethereansFactoryInitializerData = [
        0,
        VOID_ETHEREUM_ADDRESS,
        VOID_ETHEREUM_ADDRESS,
        0,
        VOID_ETHEREUM_ADDRESS,
        VOID_ETHEREUM_ADDRESS,
        0,
        VOID_ETHEREUM_ADDRESS,
        delegationFactoryBytecode
    ]

    delegationFactoryBytecode = abi.encode([`tuple(${ethereansFactoryInitializerType.join(',')})`], [ethereansFactoryInitializerData]);

    delegationFactoryBytecode = web3.eth.abi.encodeParameters(["address", "bytes"], [modelAddress, delegationFactoryBytecode]);

    delegationFactoryBytecode = web3.eth.abi.encodeParameters(["string", "address", "bytes"], [web3.currentProvider.knowledgeBase.delegationFactoryUri, web3.currentProvider.knowledgeBase.DYNAMIC_URI_RESOLVER, delegationFactoryBytecode]);

    delegationFactoryBytecode = web3.eth.abi.encodeParameters(["address", "bytes"], [web3.currentProvider.knowledgeBase.fromAddress, delegationFactoryBytecode]);

    var OrganizationFactory = await compile('@ethereansos/ethcomputationalorgs/contracts/ethereans/factories/impl/DelegationFactory');
    var organizationFactoryBytecode = new web3.eth.Contract(OrganizationFactory.abi).deploy({ data: OrganizationFactory.bin, arguments: [delegationFactoryBytecode] }).encodeABI();

    var FactoryOfFactories = await compile('@ethereansos/ethcomputationalorgs/contracts/ethereans/factoryOfFactories/model/IFactoryOfFactories');
    var factoryOfFactories = new web3.eth.Contract(FactoryOfFactories.abi, web3.currentProvider.knowledgeBase.FACTORY_OF_FACTORIES);

    var transaction = await blockchainCall(factoryOfFactories.methods.create, [web3.currentProvider.knowledgeBase.fromAddress], [[organizationFactoryBytecode]], {from:web3.currentProvider.knowledgeBase.from});

    var log = transaction.logs.filter(it => it.topics[0] === web3Utils.sha3('FactoryAdded(uint256,address,address,uint256)'))[0];
    web3.currentProvider.knowledgeBase.factoryIndices.delegation = parseInt(abi.decode(["uint256"], log.topics[1])[0].toString());
    web3.currentProvider.knowledgeBase.DELEGATION_FACTORY = abi.decode(["address"], log.topics[3])[0].toString();

    var balanceBefore = await web3.eth.getBalance(web3.currentProvider.knowledgeBase.fromAddress, web3.currentProvider.forkBlock);
    if(balanceBefore === '0') {
        balanceBefore = await web3.eth.getBalance(web3.currentProvider.knowledgeBase.fromAddress, web3.currentProvider.forkBlock + 1);
    }
    var balanceAfter = await web3.eth.getBalance(web3.currentProvider.knowledgeBase.fromAddress);
    var difference = balanceBefore.ethereansosSub(balanceAfter);
    console.log("Spent", fromDecimals(difference, 18, true));
};

async function getBytecode(location, name, version) {
    var Contract = await compile(location, name, version);
    var bytecode = new web3.eth.Contract(Contract.abi).deploy({ data : Contract.bin, arguments : ["0x"]}).encodeABI();
    return bytecode;
}