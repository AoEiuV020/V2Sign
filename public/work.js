importScripts('https://cdn.jsdelivr.net/npm/node-forge@0.7.0/dist/forge.min.js');

var keypair;
function generate() {
    keypair = forge.pki.rsa.generateKeyPair({
        bits: 2048,
        e: 0x10001
    });
    var pem = {
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey)
    };
    return pem;
}
onmessage = (event) => {
    console.log("worker.onMessage: " + event.data);
    var ret = eval(`${event.data[0]}`)(event.data[1]);
    postMessage([event.data[0], ret])
}