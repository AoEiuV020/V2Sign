if (typeof (require) != 'undefined') {
    // 保留不会执行的require以便vscode智能提示，
    var util = require('./util.js');
} else if (typeof (importScripts) != 'undefined') {
    importScripts('./util.js');
}

var keypair;

async function generate() {
    keypair = util.generate();
    return util.keypairToPem(keypair);
}

async function importPem(pem) {
    try {
        keypair = util.keypairFromPem(pem);
        return util.keypairToPem(keypair);
    } catch (e) {
        return await generate();
    }
}

async function sign(text) {
    return util.sign(text, keypair["privateKey"]);
}

async function verify(args) {
    let [text, signature, publicKey] = args;
    return util.verify(text, signature, util.publicKeyFromPem(publicKey));
}

async function hash(text) {
    return util.toHex(util.sha256(util.decode64(text)));
}

async function upload(args) {
    let data = {
        v2Id: args[0],
        nsCode: args[1],
        email: args[2],
        localSign: args[3],
        publicKey: args[4]
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
onmessage = (event) => {
    eval(`${event.data[0]}`)(event.data[1]).then((ret) => {
        postMessage([event.data[0], ret]);
    })
}