if (typeof (require) != 'undefined') {
    var forge = require('node-forge');
} else if (typeof (importScripts) != 'undefined') {
    importScripts('https://cdn.jsdelivr.net/npm/node-forge@0.7.0/dist/forge.min.js');
}

var util = util || {};

util.bits = 2048;

/**
 * 
 * @returns {forge.pki.rsa.KeyPair}
 */
util.generate = function () {
    let keypair = forge.pki.rsa.generateKeyPair({
        bits: util.bits,
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
 * @returns {forge.Bytes}
 */
util.md5 = function (text) {
    let md = forge.md.md5.create();
    md.update(text, "utf8");
    return md.digest().bytes();
}

/**
 * 
 * @param {string} text 
 * @returns {forge.Bytes}
 */
util.sha256 = function (text) {
    let md = forge.md.sha256.create();
    md.update(text, "utf8");
    return md.digest().bytes();
}

/**
 * 
 * @param {forge.Bytes} bytes 
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
 * @param {forge.Bytes} bytes 
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


/**
 * 
 * @param {string} text 
 * @param {string} password
 * @returns {forge.Bytes}
 */
util.aesEncrypt = function (text, password) {
    var key = util.md5(password);
    var iv = '0123456789101213';
    var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({
        iv
    });
    cipher.update(forge.util.createBuffer(text));
    cipher.finish();
    return cipher.output.getBytes();
}

/**
 * 
 * @param {forge.Bytes} bytes 
 * @param {string} password
 * @returns {string}
 */
util.aesDecrypt = function (bytes, password) {
    var key = util.md5(password);
    var iv = '0123456789101213';
    var cipher = forge.cipher.createDecipher('AES-CBC', key);
    cipher.start({
        iv
    });
    cipher.update(forge.util.createBuffer(bytes));
    cipher.finish();
    return cipher.output.toString();
}


/**
 * 
 * @param {string} text 
 * @param {forge.pki.rsa.PublicKey} publicKey 
 * @returns {string}
 */
 util.rsaEncrypt = function (text, publicKey) {
    return publicKey.encrypt(text);
}

/**
 * 
 * @param {forge.Bytes} bytes 
 * @param {forge.pki.rsa.PrivateKey} privateKey 
 * @returns {string}
 */
util.rsaDecrypt = function (bytes, privateKey) {
    return privateKey.decrypt(bytes);
}

if (typeof (module) != 'undefined') {
    module.exports = util;
}