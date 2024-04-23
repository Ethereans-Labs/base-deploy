var keccak = require('keccak');
var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, compile, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');
var { attachCreatorAndInitializerHookToCompiler, getHardCabledInfoBytecode, getTokenDecimals } = require('../../resources/utils');
var createProposalRulesFactoryV1 = require('../proposal_rules_factory_v1');

module.exports = async function start() {

    await attachCreatorAndInitializerHookToCompiler();

    var utilityModels = await Promise.all([
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/base/impl/ProposalsManager"),
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/base/impl/TreasuryManager"),
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/base/impl/StateManager"),
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/base/impl/MicroservicesManager"),
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/fixedInflationManager/impl/FixedInflationManager"),
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/treasurySplitterManager/impl/TreasurySplitterManager"),
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/delegationsManager/impl/DelegationsManager"),
        getBytecode("@ethereansos/ethcomputationalorgs/contracts/ext/investmentsManager/impl/InvestmentsManager")
    ]);

    for(var i in utilityModels) {
        utilityModels[i] = (await sendBlockchainTransaction(web3.currentProvider, web3.currentProvider.knowledgeBase.from, null, utilityModels[i])).contractAddress;
    }
    web3.currentProvider.knowledgeBase.models.ProposalsManager = utilityModels[0];
    web3.currentProvider.knowledgeBase.models.TreasuryManager = utilityModels[1];
    web3.currentProvider.knowledgeBase.models.StateManager = utilityModels[2];
    web3.currentProvider.knowledgeBase.models.MicroservicesManager = utilityModels[3];
    web3.currentProvider.knowledgeBase.models.FixedInflationManager = utilityModels[4];
    web3.currentProvider.knowledgeBase.models.TreasurySplitterManager = utilityModels[5];
    web3.currentProvider.knowledgeBase.models.DelegationsManager = utilityModels[6];
    web3.currentProvider.knowledgeBase.models.InvestmentsManager = utilityModels[7];

    var Organization = await compile("@ethereansos/ethcomputationalorgs/contracts/ext/subDAO/impl/SubDAO");
    var organization = await deployContract(new web3.eth.Contract(Organization.abi), Organization.bin, ['0x'], { from : web3.currentProvider.knowledgeBase.from });
    web3.currentProvider.knowledgeBase.models.SubDAO = web3Utils.toChecksumAddress(organization.options.address);

    var proposalModels = await Promise.all([
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ethereans/proposals/EthereansSubDAO", "TransferManagerProposal", "TRANSFER_MANAGER_V1", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ethereans/proposals/EthereansSubDAO", "DelegationsManagerDetacherProposal", "DELEGATIONS_MANAGER_DETACHER_V1", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ethereans/proposals/EthereansSubDAO", "DelectionsManagerSetAttachInsuranceProposal", "DELEGATIONS_MANAGER_INSURANCE_V1", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ethereans/proposals/EthereansSubDAO", "ChangeInvestmentsManagerTokensFromETHList", "TOKEN_BUY_V1", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ethereans/proposals/EthereansSubDAO", "ChangeInvestmentsManagerTokensToETHList", "TOKEN_SELL_V1", "REAL_URI_HERE", true),
        getHardCabledInfoBytecode("@ethereansos/ethcomputationalorgs/contracts/ethereans/proposals/EthereansSubDAO", "FixedInflationManagerChangeDailyInflationPercentage", "FIXED_INFLATION_V1", "REAL_URI_HERE", true)
    ]);

    for(var i in proposalModels) {
        proposalModels[i] = (await sendBlockchainTransaction(web3.currentProvider, web3.currentProvider.knowledgeBase.from, null, proposalModels[i])).contractAddress;
    }
    web3.currentProvider.knowledgeBase.models.TransferManagerProposal = proposalModels[0];
    web3.currentProvider.knowledgeBase.models.DelegationsManagerDetacherProposal = proposalModels[1];
    web3.currentProvider.knowledgeBase.models.DelectionsManagerSetAttachInsuranceProposal = proposalModels[2];
    web3.currentProvider.knowledgeBase.models.ChangeInvestmentsManagerTokensFromETHList = proposalModels[3];
    web3.currentProvider.knowledgeBase.models.ChangeInvestmentsManagerTokensToETHList = proposalModels[4];
    web3.currentProvider.knowledgeBase.models.FixedInflationManagerChangeDailyInflationPercentage = proposalModels[5];

    var utilityModelkeys = [
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_PROPOSALS_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_TREASURY_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_STATE_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_MICROSERVICES_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_FIXED_INFLATION_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_DELEGATIONS_MANAGER,
        web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_INVESTMENTS_MANAGER
    ];

    var utilityModelActive = utilityModelkeys.map(() => false);
    utilityModelActive[0] = true;
    utilityModelActive[3] = true;

    var proposalRulesManager = web3.currentProvider.knowledgeBase.PROPOSAL_RULES_FACTORY;
    if(!proposalRulesManager) {
        await createProposalRulesFactoryV1();
        proposalRulesManager = web3.currentProvider.knowledgeBase.PROPOSAL_RULES_FACTORY;
    }

    var presetArrayMaxSize = web3.currentProvider.knowledgeBase.presetValues;

    var delegationsMaxSize = web3.currentProvider.knowledgeBase.delegationsMaxSize;

    var factoryLazyInitData = abi.encode(["address[]", "bytes32[]", "bool[]", "address[]","address", "uint256", "uint256"], [utilityModels, utilityModelkeys, utilityModelActive, proposalModels, proposalRulesManager, presetArrayMaxSize, delegationsMaxSize]);

    var organizationFactoryLazyInitData = {
        feePercentageForTransacted: "0",
        feeReceiver: VOID_ETHEREUM_ADDRESS,
        tokenToTransferOrBurnAddressInCreation: VOID_ETHEREUM_ADDRESS,
        transferOrBurnAmountInCreation: "0",
        transferOrBurnReceiverInCreation: VOID_ETHEREUM_ADDRESS,
        tokenToTransferOrBurnAddressInApplication: VOID_ETHEREUM_ADDRESS,
        transferOrBurnAmountInApplication: "0",
        transferOrBurnReceiverInApplication: VOID_ETHEREUM_ADDRESS,
        factoryLazyInitData
    };

    var lazyInitData = abi.encode(["tuple(uint256,address,address,uint256,address,address,uint256,address,bytes)"], [Object.values(organizationFactoryLazyInitData)]);
    lazyInitData = abi.encode(["address", "bytes"], [web3.currentProvider.knowledgeBase.models.SubDAO, lazyInitData]);
    lazyInitData = abi.encode(["string", "address", "bytes"], ["REAL_URI_HERE", web3.currentProvider.knowledgeBase.DYNAMIC_URI_RESOLVER, lazyInitData]);
    lazyInitData = abi.encode(["address", "bytes"], [VOID_ETHEREUM_ADDRESS, lazyInitData]);

    var Factory = await compile("@ethereansos/ethcomputationalorgs/contracts/ethereans/factories/impl/OrganizationFactory");
    var bytecode = new web3.eth.Contract(Factory.abi).deploy({data : Factory.bin, arguments: [lazyInitData]}).encodeABI();

    var FactoryOfFactories = await compile('@ethereansos/ethcomputationalorgs/contracts/ethereans/factoryOfFactories/model/IFactoryOfFactories');
    var factoryOfFactories = new web3.eth.Contract(FactoryOfFactories.abi, web3.currentProvider.knowledgeBase.FACTORY_OF_FACTORIES);

    var transaction = await blockchainCall(factoryOfFactories.methods.create, [web3.currentProvider.knowledgeBase.fromAddress], [[bytecode]], {from : web3.currentProvider.knowledgeBase.from});

    var log = transaction.logs.filter(it => it.topics[0] === web3Utils.sha3('FactoryAdded(uint256,address,address,uint256)'))[0];
    web3.currentProvider.knowledgeBase.factoryIndices.organization = parseInt(abi.decode(["uint256"], log.topics[1])[0].toString());
    web3.currentProvider.knowledgeBase.ORGANIZATION_FACTORY = abi.decode(["address"], log.topics[3])[0].toString();
};

async function getBytecode(location, name, version) {
    if(location.indexOf('ProposalsManager') !== -1) {
        return await compileProposalsManager();
    }
    var Contract = await compile(location, name, version);
    var bytecode = new web3.eth.Contract(Contract.abi).deploy({ data : Contract.bin, arguments : ["0x"]}).encodeABI();
    return bytecode;
}

async function compileProposalsManager() {
    var ProposalsManagerLibrary = await compile("@ethereansos/ethcomputationalorgs/contracts/base/impl/ProposalsManager", "ProposalsManagerLibrary");
    var proposalsManagerLibrary = await deployContract(new web3.eth.Contract(ProposalsManagerLibrary.abi), ProposalsManagerLibrary.bin, [], { from : web3.currentProvider.knowledgeBase.from});
    var proposalsManagerLibraryAddress = web3Utils.toChecksumAddress(proposalsManagerLibrary.options.address);

    var path1 = ProposalsManagerLibrary.ast.absolutePath + ":" + ProposalsManagerLibrary.name;
    var key1 = '__$' + keccak('keccak256').update(path1).digest().toString('hex').slice(0, 34) + '$__';

    compile.onCompilations.unshift(function(Contract) {
        Contract.bin = Contract.bin.split(key1).join(proposalsManagerLibraryAddress.substring(2));
        Contract['bin-runtime'] = (Contract['bin-runtime'] || '').split(key1).join(proposalsManagerLibraryAddress.substring(2));
    });

    var Contract = await compile("@ethereansos/ethcomputationalorgs/contracts/base/impl/ProposalsManager", "ProposalsManager");

    compile.onCompilations.shift();

    var bytecode = new web3.eth.Contract(Contract.abi).deploy({ data : Contract.bin, arguments : ["0x"]}).encodeABI();
    return bytecode;
}

module.exports.test = async function test() {
    web3.currentProvider.knowledgeBase.ERC20Tokens && console.log("Organization", await createOrganization(await createMockOrganizationDeployData()));
};

async function createMockOrganizationDeployData(noRootProposal, noFixedInflation) {

    var organizationUri = "REAL_URI_HERE";

    var tokenAddress = web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address;

    var proposalRules = {
        host : accounts[0],
        proposalDuration : 1000,
        hardCapPercentage : 3,
        quorumPercentage : 0,
        validationBomb : 999999999999999
    }

    var proposalsManagerLazyInitData = noRootProposal ? {} : {
        ...proposalRules
    };

    var proposalModelsData = {
        transferManager : {...proposalRules, maxPercentagePerToken : 20},
        delegationsManagerBan : {...proposalRules},
        delegationsManagerInsurance : {...proposalRules, presetValues : [30, 50, 90, 100, 200, 250]},
        changeInvestmentsManagerTokensFromETHList : {...proposalRules, maxTokens : 5},
        changeInvestmentsManagerTokensToETHList : {...proposalRules, maxTokens : 5, maxPercentagePerToken : 20}
    }

    var fixedInflationManagerLazyInitData = noFixedInflation ? undefined : {
        tokenMinterOwner :  accounts[0],
        inflationPercentage : 5,
        _bootstrapFundWalletAddress: accounts[1],
        _bootstrapFundWalletPercentage: 25,
        _rawTokenComponentKeys : [],
        _rawTokenComponentsPercentages : [],
        _swappedTokenComponentKeys : [web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER],
        _swappedTokenComponentsPercentages : [],
        ammPlugin : accounts[0],
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.OS_ETH_LP],
        swapPath : [web3.currentProvider.knowledgeBase.WETH_ADDRESS],
        executionInterval : 5000,
        firstExecution : 0
    };
    proposalModelsData.fixedInflation = noFixedInflation ? undefined : {
        presetValues : [0.5, 3, 5, 9, 11, 16],
        ...proposalRules
    }

    var treasurySplitterManagerLazyInitData = {
        keys : [
            web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_DELEGATIONS_MANAGER,
            web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_INVESTMENTS_MANAGER
        ],
        percentages : [
            30
        ],
        splitInterval : 3500,
        firstSplit : 0
    };

    var delegationsManagerLazyInitData = {
        delegationAttachInsurance : 0
    };

    var investmentsManagerLazyInitData = {
        operations : getInvestmentsManagerMockOperations(),
        swapToEtherInterval : 100,
        firstSwapToEtherEvent : 0
    };

    return {
        organizationUri,
        tokenAddress,
        proposalsManagerLazyInitData,
        fixedInflationManagerLazyInitData,
        treasurySplitterManagerLazyInitData,
        delegationsManagerLazyInitData,
        investmentsManagerLazyInitData,
        proposalModelsData
    };
}

function getInvestmentsManagerMockOperations() {
    return [{
        inputTokenAddress : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        ammPlugin : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address],
        swapPath : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address]
    }, {
        inputTokenAddress : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        ammPlugin : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address],
        swapPath : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address]
    }, {
        inputTokenAddress : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        ammPlugin : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address],
        swapPath : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address]
    }, {
        inputTokenAddress : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        ammPlugin : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address],
        swapPath : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address]
    }, {
        inputTokenAddress : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        ammPlugin : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address],
        swapPath : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address]
    }, {
        ammPlugin : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address],
        swapPath : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address]
    }, {
        ammPlugin : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address],
        swapPath : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address]
    }, {
        ammPlugin : web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address,
        liquidityPoolAddresses : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address],
        swapPath : [web3.currentProvider.knowledgeBase.ERC20Tokens.OS.address]
    }];
}

async function createOrganization(organizationDeployData) {
    var OrganizationFactory = await compile("@ethereansos/ethcomputationalorgs/contracts/ethereans/factories/impl/OrganizationFactory");
    var organizationFactory = new web3.eth.Contract(OrganizationFactory.abi, web3.currentProvider.knowledgeBase.ORGANIZATION_FACTORY);

    var deployData = await createOrganizationDeployData(organizationDeployData);

    var transaction = await blockchainCall(organizationFactory.methods.deploy, deployData);

    var log = transaction.logs.filter(it => it.topics[0] === web3Utils.sha3('Deployed(address,address,address,bytes)'));
    log = log[log.length - 1];
    var address = log.topics[2];
    address = abi.decode(["address"], address)[0].toString();

    return address;
}

async function createOrganizationDeployData(organizationDeployData) {

    var { tokenAddress, organizationUri, proposalsManagerLazyInitData, fixedInflationManagerLazyInitData, treasurySplitterManagerLazyInitData, delegationsManagerLazyInitData, investmentsManagerLazyInitData } = organizationDeployData;

    proposalsManagerLazyInitData && (proposalsManagerLazyInitData.tokenAddress = tokenAddress);
    delegationsManagerLazyInitData.tokenAddress = tokenAddress;
    fixedInflationManagerLazyInitData && (fixedInflationManagerLazyInitData.tokenAddress = tokenAddress);

    proposalsManagerLazyInitData = await createProposalsManagerLazyInitData(proposalsManagerLazyInitData);
    fixedInflationManagerLazyInitData = await createFixedInflationManagerLazyInitData(fixedInflationManagerLazyInitData);
    treasurySplitterManagerLazyInitData = await createTreasurySplitterManagerLazyInitData(treasurySplitterManagerLazyInitData);
    delegationsManagerLazyInitData = await createDelegationsManagerLazyInitData(delegationsManagerLazyInitData);
    investmentsManagerLazyInitData = await createInvestmentsManagerLazyInitData(investmentsManagerLazyInitData);

    mandatoryComponentsDeployData = [proposalsManagerLazyInitData];
    additionalComponents = [1, 5, 6, 7];
    additionalComponentsDeployData = ['0x', treasurySplitterManagerLazyInitData, delegationsManagerLazyInitData, investmentsManagerLazyInitData];
    specialComponentsData = [];
    specificOrganizationData = await createSubDAOProposalModels(organizationDeployData.proposalModelsData);

    if(fixedInflationManagerLazyInitData != '0x') {
        additionalComponents = [...additionalComponents.slice(0, 1), 4, ...additionalComponents.slice(1)];
        additionalComponentsDeployData = [...additionalComponentsDeployData.slice(0, 1), fixedInflationManagerLazyInitData, ...additionalComponentsDeployData.slice(1)];
    }

    var organizationDeployData = {
        uri : organizationUri,
        mandatoryComponentsDeployData,
        additionalComponents,
        additionalComponentsDeployData,
        specialComponentsData,
        specificOrganizationData
    };

    var type = 'tuple(string,bytes[],uint256[],bytes[],bytes[],bytes)';
    var deployData = abi.encode([type], [Object.values(organizationDeployData)]);

    return deployData;
}

function createProposalRules(data) {

    var {proposalDuration, hardCapPercentage, quorumPercentage, validationBomb} = data;

    var canTerminateAddresses = [];
    var validatorsAddresses = [];
    var canTerminateData = [];
    var validatorsData = [];

    if(proposalDuration) {
        canTerminateAddresses.push(1);
        canTerminateData.push(abi.encode(["uint256"], [proposalDuration]));
    }

    if(hardCapPercentage) {
        canTerminateAddresses.push(2);
        canTerminateData.push(abi.encode(["uint256", "bool"], [toDecimals(hardCapPercentage / 100, 18), true]));
    }

    if(quorumPercentage) {
        validatorsAddresses.push(3);
        validatorsData.push(abi.encode(["uint256", "bool"], [toDecimals(quorumPercentage / 100, 18), true]));
    }

    if(validationBomb) {
        validatorsAddresses.push(4);
        validatorsData.push(abi.encode(["uint256"], [validationBomb]));
    }

    canTerminateAddresses = canTerminateAddresses.map(it => abi.decode(["address"], abi.encode(["uint256"], [it]))[0].toString());
    validatorsAddresses = validatorsAddresses.map(it => abi.decode(["address"], abi.encode(["uint256"], [it]))[0].toString());

    return {
        canTerminateAddresses,
        validatorsAddresses,
        canTerminateData,
        validatorsData
    }
}

async function createProposalsManagerLazyInitData(data) {

    var {tokenAddress, host} = data;

    var {
        canTerminateAddresses,
        validatorsAddresses,
        canTerminateData,
        validatorsData
    } = createProposalRules(data);

    var tokens = tokenAddress;
    tokens = tokens && (Array.isArray(tokens) ? tokens : [tokens]);

    var proposalConfiguration = {
        collections : tokens.map(() => VOID_ETHEREUM_ADDRESS),
        objectIds : tokens.map(it => abi.decode(["uint256"], abi.encode(["address"], [it]))[0].toString()),
        weights : tokens.map(() => 1),
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        canTerminateAddresses,
        validatorsAddresses,
        creationData : !host || host === VOID_ETHEREUM_ADDRESS ? '0x' : abi.encode(["address", "bool"], [host, true]),
        triggeringData : '0x',
        canTerminateData,
        validatorsData
    };

    var type = 'tuple(address[],uint256[],uint256[],address,address,address[],address[],bytes,bytes,bytes[],bytes[])';

    var data = abi.encode([type], [Object.values(proposalConfiguration)]);

    return data;
}

async function createFixedInflationManagerLazyInitData(data) {

    if(!data) {
        return '0x';
    }

    var { tokenAddress, tokenMinterOwner, inflationPercentage, _bootstrapFundWalletAddress, _bootstrapFundWalletPercentage, _rawTokenComponentKeys, _rawTokenComponentsPercentages, _swappedTokenComponentKeys, _swappedTokenComponentsPercentages, ammPlugin, liquidityPoolAddresses, swapPath, executionInterval, firstExecution } = data;

    var executorRewardPercentage = web3.currentProvider.knowledgeBase.executorRewardPercentage;
    var prestoAddress = web3.currentProvider.knowledgeBase.PRESTO_ADDRESS;
    var tokenMinter = await createFixedInflationTokenMinter(tokenAddress, tokenMinterOwner);
    var lazyInitData = [];
    inflationPercentage = toDecimals(inflationPercentage / 100, 18);
    _bootstrapFundWalletPercentage = toDecimals(_bootstrapFundWalletPercentage / 100, 18);
    _bootstrapFundWalletOwner = _bootstrapFundWalletAddress;
    _bootstrapFundIsRaw = false;
    _defaultBootstrapFundComponentKey = VOID_BYTES32;
    _rawTokenComponentKeys = _rawTokenComponentKeys || [];
    _rawTokenComponentsPercentages = (_rawTokenComponentsPercentages || []).map(it => toDecimals(it / 100, 18));
    _swappedTokenComponentKeys = _swappedTokenComponentKeys || [];
    _swappedTokenComponentsPercentages = (_swappedTokenComponentsPercentages || []).map(it => toDecimals(it / 100, 18));
    lazyInitData.push(abi.encode(["address", "uint256", "address", "bytes"], [prestoAddress, executorRewardPercentage, tokenAddress, tokenMinter]));
    lazyInitData.push(abi.encode(["uint256", "uint256", "uint256"], [inflationPercentage, executionInterval, firstExecution || 0]));
    lazyInitData.push(abi.encode(["address", "address", "uint256", "bool", "bytes32"], [_bootstrapFundWalletOwner, _bootstrapFundWalletAddress, _bootstrapFundWalletPercentage, _bootstrapFundIsRaw, _defaultBootstrapFundComponentKey]));
    lazyInitData.push(abi.encode(["bytes32[]", "uint256[]", "bytes32[]", "uint256[]"], [_rawTokenComponentKeys, _rawTokenComponentsPercentages, _swappedTokenComponentKeys, _swappedTokenComponentsPercentages]));
    lazyInitData.push(abi.encode(["address", "address[]", "address[]"], [ammPlugin, liquidityPoolAddresses, swapPath]));
    lazyInitData = abi.encode(["bytes[]"], [lazyInitData]);
    return lazyInitData;
}

async function createFixedInflationTokenMinter(tokenAddress, owner) {
    if(!owner) {
        return VOID_ETHEREUM_ADDRESS;
    }

    tokenAddress = web3Utils.toChecksumAddress(tokenAddress);

    var TokenMinter = await getTokenMinter();
    var deployData = new web3.eth.Contract(TokenMinter.abi).deploy({ data: TokenMinter.bin, arguments : [web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_FIXED_INFLATION_MANAGER, tokenAddress, owner || VOID_ETHEREUM_ADDRESS]}).encodeABI();
    return deployData;
}

async function createTreasurySplitterManagerLazyInitData(data) {

    var { keys, percentages, splitInterval, firstSplitEvent } = data;

    var executorRewardPercentage = web3.currentProvider.knowledgeBase.executorRewardPercentage;
    var flushExecutorRewardPercentage = web3.currentProvider.knowledgeBase.executorRewardPercentage;
    var _flushKey = VOID_BYTES32;
    percentages = percentages.map(it => toDecimals(it / 100, 18));
    var lazyInitData = abi.encode(["uint256", "uint256", "bytes32[]", "uint256[]", "bytes32", "uint256", "uint256"], [firstSplitEvent || 0, splitInterval, keys, percentages, _flushKey, flushExecutorRewardPercentage, executorRewardPercentage]);

    return lazyInitData;
}

async function createDelegationsManagerLazyInitData(data) {

    var { tokenAddress, attachInsurance } = data

    var executorRewardPercentage = web3.currentProvider.knowledgeBase.executorRewardPercentage;

    var flusherKey = web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER;

    var FactoryOfFactories = await compile('@ethereansos/ethcomputationalorgs/contracts/ethereans/factoryOfFactories/model/IFactoryOfFactories');
    var factoryOfFactories = new web3.eth.Contract(FactoryOfFactories.abi, web3.currentProvider.knowledgeBase.FACTORY_OF_FACTORIES);

    var list = [];

    try {
        list = await factoryOfFactories.methods.get(web3.currentProvider.knowledgeBase.factoryIndices.delegation).call();
        list = [...list[1]];
    } catch(e) {}

    var decimals = await getTokenDecimals(tokenAddress);
    attachInsurance = toDecimals(attachInsurance || 0, decimals);

    var lazyInitData = abi.encode(["address[]", "address[]"], [list, []]);
    lazyInitData = abi.encode(["uint256", "address", "bytes32", "bytes"], [attachInsurance, VOID_ETHEREUM_ADDRESS, flusherKey, lazyInitData]);
    lazyInitData = abi.encode(["uint256", "address", "uint256", "bytes"], [executorRewardPercentage, VOID_ETHEREUM_ADDRESS, abi.decode(["uint256"], abi.encode(["address"], [tokenAddress]))[0].toString(), lazyInitData]);

    return lazyInitData;
}

async function createInvestmentsManagerLazyInitData(data) {

    var { operations, swapToEtherInterval, firstSwapToEtherEvent } = data;

    operations = operations.map(it => ({
        inputTokenAddress : it.inputTokenAddress || VOID_ETHEREUM_ADDRESS,
        inputTokenAmount : 0,
        ammPlugin : it.ammPlugin,
        liquidityPoolAddresses : it.liquidityPoolAddresses,
        swapPath : it.swapPath,
        enterInETH : false,
        exitInETH : false,
        tokenMins : [],
        receivers : [],
        receiversPercentages : []
    }))

    var executorRewardPercentage = web3.currentProvider.knowledgeBase.executorRewardPercentage;
    var prestoAddress = web3.currentProvider.knowledgeBase.PRESTO_ADDRESS;
    var _organizationComponentKey = web3.currentProvider.knowledgeBase.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER;
    var type = 'tuple(address,uint256,address,address[],address[],bool,bool,uint256[],address[],uint256[])[]';
    operations = abi.encode([type], [operations.map(it => Object.values(it))]);

    var lazyInitData = abi.encode(["bytes32", "uint256", "address", "uint256", "uint256", "bytes"], [_organizationComponentKey, executorRewardPercentage, prestoAddress, firstSwapToEtherEvent || 0, swapToEtherInterval, operations]);

    return lazyInitData;
}

async function createSubDAOProposalModels(proposalModelsData) {
    Object.values(proposalModelsData).forEach(it => it && (it.proposalRules = createProposalRules(it)));
    var subDAOProposalModels = [];
    subDAOProposalModels = [...subDAOProposalModels, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : false,
        presetValues : [
            abi.encode(["uint256"], [toDecimals(proposalModelsData.transferManager.maxPercentagePerToken / 100, 18)])
        ],
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.transferManager.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.transferManager.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.transferManager.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.transferManager.proposalRules.validatorsData]
    }, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : false,
        presetValues : [],
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.delegationsManagerBan.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.delegationsManagerBan.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.delegationsManagerBan.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.delegationsManagerBan.proposalRules.validatorsData]
    }, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : true,
        presetValues : proposalModelsData.delegationsManagerInsurance.presetValues.map(it => abi.encode(["uint256"], [it])),
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.delegationsManagerInsurance.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.delegationsManagerInsurance.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.delegationsManagerInsurance.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.delegationsManagerInsurance.proposalRules.validatorsData]
    }, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : false,
        presetValues : [
            abi.encode(["uint256"], [proposalModelsData.changeInvestmentsManagerTokensFromETHList.maxTokens])
        ],
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.changeInvestmentsManagerTokensFromETHList.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.changeInvestmentsManagerTokensFromETHList.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.changeInvestmentsManagerTokensFromETHList.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.changeInvestmentsManagerTokensFromETHList.proposalRules.validatorsData]
    }, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : false,
        presetValues : [
            abi.encode(["uint256", "uint256"], [proposalModelsData.changeInvestmentsManagerTokensToETHList.maxTokens, toDecimals(proposalModelsData.changeInvestmentsManagerTokensToETHList.maxPercentagePerToken / 100, 18)])
        ],
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules.validatorsData]
    }];

    if(proposalModelsData.fixedInflation) {
        subDAOProposalModels = [...subDAOProposalModels, {
            source: VOID_ETHEREUM_ADDRESS,
            uri : '',
            isPreset : true,
            presetValues : proposalModelsData.fixedInflation.presetValues.map(it => abi.encode(["uint256"], [toDecimals(it / 100, 18)])),
            presetProposals : [],
            creationRules : VOID_ETHEREUM_ADDRESS,
            triggeringRules : VOID_ETHEREUM_ADDRESS,
            votingRulesIndex : 0,
            canTerminateAddresses : [proposalModelsData.fixedInflation.proposalRules.canTerminateAddresses],
            validatorsAddresses : [proposalModelsData.fixedInflation.proposalRules.validatorsAddresses],
            creationData : '0x',
            triggeringData : '0x',
            canTerminateData : [proposalModelsData.fixedInflation.proposalRules.canTerminateData],
            validatorsData : [proposalModelsData.fixedInflation.proposalRules.validatorsData]
        }];
    }

    var type = 'tuple(address,string,bool,bytes[],bytes32[],address,address,uint256,address[][],address[][],bytes,bytes,bytes[][],bytes[][])[]';

    subDAOProposalModels = abi.encode([type], [subDAOProposalModels.map(Object.values)]);

    return subDAOProposalModels;
}

async function getTokenMinter() {
    var code = `// SPDX-License-Identifier: MIT
    pragma solidity >=0.7.0;

    interface IOrganization {
        function host() external view returns(address);
        function get(bytes32) external view returns(address);
    }

    contract TokenMinter {

        bytes32 public immutable componentKey;
        address public immutable host;
        address public immutable tokenAddress;
        address public owner;

        constructor(bytes32 _componentKey, address _tokenAddress, address _owner) {
            componentKey = _componentKey;
            host = IOrganization(msg.sender).host();
            tokenAddress = _tokenAddress;
            owner = _owner;
        }

        modifier ownerOnly {
            require(msg.sender == owner, "unauthorized");
            _;
        }

        function transferOwnership(address newOwner) external ownerOnly {
            owner = newOwner;
        }

        function transferTokenOwnership(address newOwner) external ownerOnly {
            TokenMinter(tokenAddress).transferOwnership(newOwner);
        }

        function mint(address account, uint256 amount) external {
            require(IOrganization(host).get(componentKey) == msg.sender, "unauthorized");
            TokenMinter(tokenAddress).mint(account, amount);
        }
    }`;

    var TokenMinter = await compile(code, 'TokenMinter');
    console.log(JSON.stringify(TokenMinter.abi));
    console.log(TokenMinter.bin);
    return TokenMinter;
}