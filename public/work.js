if (typeof (require) != 'undefined') {
    // 保留不会执行的require以便vscode智能提示，
    var util = require('./util.js');
} else if (typeof (importScripts) != 'undefined') {
    importScripts('./util.js');
}

var callbacks = {};

var keypair;

callbacks.generate = async function() {
    keypair = util.generate();
    return util.keypairToPem(keypair);
}

callbacks.importPem = async function(pem) {
    try {
        keypair = util.keypairFromPem(pem);
        return util.keypairToPem(keypair);
    } catch (e) {
        return await generate();
    }
}

callbacks.sign = async function(text) {
    return util.sign(text, keypair["privateKey"]);
}

callbacks.verify = async function(text, signature, publicKey) {
    return util.verify(text, signature, util.publicKeyFromPem(publicKey));
}

callbacks.hash = async function(text) {
    return util.toHex(util.sha256(util.decode64(text)));
}


callbacks.upload = async function(v2Id, nsCode, email, localSign, publicKey) {
    let data = {
        v2Id,
        nsCode,
        email,
        localSign,
        publicKey
    }
    let response = await fetch('./api/upload', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    var body;
    if (response.status == 200) {
        body = await response.json();
    }
    return {
        status: response.status,
        body
    };
}

callbacks.encrypt = async function(value, password, publicKey) {
    value = util.aesEncrypt(value, password);
    value = util.rsaEncrypt(value, util.publicKeyFromPem(publicKey));
    value = util.encode64(value);
    return value;
}
callbacks.query = async function(key, value) {
    let data = {
        key,
        value
    }
    let response = await fetch('./api/query', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    var body;
    if (response.status == 200) {
        body = await response.json();
    }
    return {
        status: response.status,
        body
    };
}
onmessage = (event) => {
    callbacks[event.data[0]](...(event.data[1])).then((ret) => {
        postMessage([event.data[0], ret]);
    }, (err) => {
        postMessage([event.data[0]]);
    })
}