if (typeof (require) != 'undefined') {
    var forge = require('node-forge');
} else if (typeof (importScripts) != 'undefined') {
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

function _publicKeyFromPem(publicKey) {
    return forge.pki.publicKeyFromPem(publicKey);
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

function _verify(text, signature, publicKey) {
    pss = forge.pss.create({
        md: forge.md.sha1.create(),
        mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
        saltLength: 20
    });
    md = forge.md.sha1.create();
    md.update(text, "utf8");
    let verified = publicKey.verify(
        md.digest().getBytes(),
        _decode64(signature),
        pss
    );
    return verified;
}

function _md5(text) {
    let md = forge.md.md5.create();
    md.update(text, "utf8");
    return md.digest().bytes();
}

function _toHex(bytes) {
    return forge.util.bytesToHex(bytes);
}

function _fromHex(text) {
    return forge.util.hexToBytes(text);
}

function _encode64(bytes) {
    return forge.util.encode64(bytes);
}

function _decode64(text) {
    return forge.util.decode64(text);
}

if (typeof (module) != 'undefined') {
    module.exports = {
        _generate,
        _keypairToPem,
        _publicKeyFromPem,
        _sign,
        _verify,
        _md5,
        _toHex,
        _fromHex,
        _encode64,
        _decode64,
    };
}