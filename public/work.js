importScripts('./utils.js');

var keypair;

async function generate() {
    keypair = _generate();
    let pem = _keypairToPem(keypair);
    return pem;
}

async function sign(text) {
    return _sign(text, keypair["privateKey"]);
}

async function upload(args) {
    let data = {
        vi: args[0],
        nc: args[1],
        em: args[2],
        ls: args[3],
        pk: args[4]
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