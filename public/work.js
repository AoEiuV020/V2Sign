importScripts('./utils.js');

var keypair;

async function generate() {
    keypair = await _generate();
    let pem = await _keypairToPem(keypair);
    return pem;
}

async function sign(text) {
    return await _sign(text, keypair["privateKey"]);
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
    let text = await response.text();
    return text;
}
onmessage = (event) => {
    console.log("worker.onMessage: " + event.data);
    eval(`${event.data[0]}`)(event.data[1]).then((ret) => {
        postMessage([event.data[0], ret]);
    })
}