if (typeof (require) != 'undefined') {
    var forge = require('node-forge');
} else if (typeof (importScripts) != 'undefined') {
    importScripts('https://cdn.jsdelivr.net/npm/node-forge@0.7.0/dist/forge.min.js');
}

var util = util || {};

/**
 * 
 * @returns {forge.pki.rsa.KeyPair}
 */
util.generate = function () {
    let keypair = forge.pki.rsa.generateKeyPair({
        bits: 2048,
        e: 0x10001
    });
    return keypair;
}

/**
 * 
 * @param {forge.pki.rsa.KeyPair} keypair 
 * @returns {{privateKey: string, publicKey: string}}
 */
util.keypairToPem = function (keypair) {
    return {
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey)
    };
}

/**
 * 
 * @param {{privateKey: string, publicKey: string}} pem 
 * @returns {forge.pki.rsa.KeyPair}
 */
util.keypairFromPem = function (pem) {
    return {
        privateKey: util.privateKeyFromPem(pem.privateKey),
        publicKey: util.publicKeyFromPem(pem.publicKey)
    };
}

/**
 * 
 * @param {string} publicKey 
 * @returns {forge.pki.rsa.PublicKey}
 */
util.publicKeyFromPem = function (publicKey) {
    return forge.pki.publicKeyFromPem(publicKey);
}

/**
 * 
 * @param {string} privateKey 
 * @returns {forge.pki.rsa.PrivateKey}
 */
util.privateKeyFromPem = function (privateKey) {
    return forge.pki.privateKeyFromPem(privateKey);
}

/**
 * 
 * @param {string} text 
 * @param {forge.pki.rsa.PrivateKey} privateKey 
 * @returns {string}
 */
util.sign = function (text, privateKey) {
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

/**
 * 
 * @param {string} text 
 * @param {string} signature 
 * @param {forge.pki.rsa.PublicKey} publicKey 
 * @returns {string}
 */
util.verify = function (text, signature, publicKey) {
    pss = forge.pss.create({
        md: forge.md.sha1.create(),
        mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
        saltLength: 20
    });
    md = forge.md.sha1.create();
    md.update(text, "utf8");
    let verified = publicKey.verify(
        md.digest().getBytes(),
        util.decode64(signature),
        pss
    );
    return verified;
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
util.md5 = function (text) {
    let md = forge.md.md5.create();
    md.update(text, "utf8");
    return md.digest().bytes();
}

/**
 * 
 * @param {string} bytes 
 * @returns {string}
 */
util.toHex = function (bytes) {
    return forge.util.bytesToHex(bytes);
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
util.fromHex = function (text) {
    return forge.util.hexToBytes(text);
}

/**
 * 
 * @param {string} bytes 
 * @returns {string}
 */
util.encode64 = function (bytes) {
    return forge.util.encode64(bytes);
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
util.decode64 = function (text) {
    return forge.util.decode64(text);
}

if (typeof (module) != 'undefined') {
    module.exports = util;
}