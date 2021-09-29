importScripts('./util.js');

var keypair;

async function generate() {
    keypair = util.generate();
    let pem = util.keypairToPem(keypair);
    return pem;
}

async function sign(text) {
    return util.sign(text, keypair["privateKey"]);
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
    var text;
    if (response.status != 200) {
        text = "失败： " + response.status;
    } else {
        text = await response.text();
    }
    return text;
}
onmessage = (event) => {
    eval(`${event.data[0]}`)(event.data[1]).then((ret) => {
        postMessage([event.data[0], ret]);
    })
}