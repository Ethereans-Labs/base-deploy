var keccak = require('keccak');
var { abi, compile, web3Utils } = require('@ethereansos/multiverse');

var callback;

async function attachCreatorAndInitializerHookToCompiler() {

    if(callback && compile.onCompilations && compile.onCompilations.indexOf(callback) !== -1) {
        return;
    }

    var Creator = await compile('@ethereansos/swissknife/contracts/lib/Creator');

    var path1 = Creator.ast.absolutePath + ":" + Creator.name;
    var key1 = '__$' + keccak('keccak256').update(path1).digest().toString('hex').slice(0, 34) + '$__';

    var Initializer = await compile('@ethereansos/swissknife/contracts/lib/Initializer');
    Initializer.bin = Initializer.bin.split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2));
    Initializer['bin-runtime'] = (Initializer['bin-runtime'] || '').split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2));

    var path2 = Initializer.ast.absolutePath + ":" + Initializer.name;
    var key2 = '__$' + keccak('keccak256').update(path2).digest().toString('hex').slice(0, 34) + '$__';

    callback = callback || function callback(Contract) {
        Contract.bin = Contract.bin.split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2)).split(key2).join(web3.currentProvider.knowledgeBase.Initializer.substring(2));
        Contract['bin-runtime'] = (Contract['bin-runtime'] || '').split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2)).split(key2).join(web3.currentProvider.knowledgeBase.Initializer.substring(2));
    };

    if(compile.onCompilations && compile.onCompilations.indexOf(callback) !== -1) {
        return;
    }

    compile.onCompilations = [
        callback,
        ...(compile.onCompilations || [])
    ];
}

async function getHardcabledInfoData(addr, method) {
    if(!method) {
        return await Promise.all([
            getHardcabledInfoData(addr, "LABEL"),
            getHardcabledInfoData(addr, "uri")
        ]);
    }
    try {
        var data = await web3.eth.call({
            to : addr,
            data : web3Utils.sha3(method + '()').substring(0, 10)
        });
        var result = abi.decode(["string"], data)[0];
        return result;
    } catch(e) {
        console.log(addr, method, e.message);
    }
    return method;
}

function fillWithZeroes(data, limit) {
    limit = limit || 66
    data = data.startsWith('0x') ? data : ('0x' + data);
    while(data.length < limit) {
        data += '0';
    }
    return data;
}

async function getHardCabledInfoBytecode(location, name, LABEL, uri, isLazyInit) {
    var Contract = await compile(location, name);
    var strings = toBytes32Array(LABEL, uri);
    var args = [strings];
    isLazyInit && args.push('0x');
    var bytecode = new web3.eth.Contract(Contract.abi).deploy({data : Contract.bin, arguments : args}).encodeABI();
    return bytecode;
}

function toBytes32Array(LABEL, uri) {
    var array = [
        fillWithZeroes(web3Utils.toHex(LABEL))
    ];
    uri = web3Utils.toHex(uri).substring(2);
    array.push(fillWithZeroes(uri.substring(0, 64)));
    uri = uri.substring(64);
    array.push(fillWithZeroes(uri.substring(0, 64)));
    uri = uri.substring(64);
    array.push(fillWithZeroes(uri.substring(0, 64)));
    uri = uri.substring(64);
    array.push(fillWithZeroes(uri.substring(0, 64)));
    uri = uri.substring(64);
    array.push(fillWithZeroes(uri.substring(0, 64)));
    return array;
}

async function getTokenDecimals(tokenAddress) {
    var response = await web3.eth.call({
        to : tokenAddress,
        data : web3Utils.sha3('decimals()').substring(0, 10)
    });

    response = abi.decode(["uint256"], response)[0].toString();
    return parseInt(response);
}

module.exports = {
    attachCreatorAndInitializerHookToCompiler,
    getHardcabledInfoData,
    fillWithZeroes,
    getHardCabledInfoBytecode,
    toBytes32Array,
    getTokenDecimals
}