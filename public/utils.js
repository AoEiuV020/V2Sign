if (typeof(require) != 'undefined') {
    var forge = require('node-forge');
} else if (typeof(importScripts) != 'undefined') {
    importScripts('https://cdn.jsdelivr.net/npm/node-forge@0.7.0/dist/forge.min.js');
}

function _generate() {
    let keypair = forge.pki.rsa.generateKeyPair({
        bits: 2048,
        e: 0x10001
    });
    return keypair;
}

function _keypairToPem(keypair) {
    return {
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey)
    };
}

function _sign(text, privateKey) {
    let pss = forge.pss.create({
        md: forge.md.sha1.create(),
        mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
        saltLength: 20
    });
    let md = forge.md.sha1.create();
    md.update(text, "utf8");
    let signature = forge.util.encode64(privateKey.sign(md, pss));
    return signature;
}

if (typeof(module) != 'undefined') {
    module.exports = { _generate, _keypairToPem, _sign };
}