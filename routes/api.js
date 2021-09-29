var express = require('express');
var router = express.Router();
var util = require('../public/util.js');
var fs = require('fs');
var path = require("path");

var dataDir = process.env.dataDir || './data';
console.log('dataDir: ' + path.resolve(dataDir));

function save(text, ...pathSegments) {
  let file = path.resolve(...pathSegments);
  fs.mkdirSync(path.dirname(file), {
    recursive: true
  })
  fs.writeFileSync(file, text);
}

router.post('/upload', async function (req, res) {
  let data = req.body;
  console.log(data);
  let {
    v2Id,
    nsCode,
    email,
    localSign,
    publicKey
  } = data;
  v2Id = v2Id.replace(/\s/g, '');
  nsCode = nsCode.replace(/[^\d]/g, '');
  email = email.replace(/\s/g, '');
  if (!v2Id || !nsCode || !email || !localSign || !publicKey) {
    res.sendStatus(400);
    return;
  }
  let content = v2Id + nsCode + email;
  let fPublicKey = util.publicKeyFromPem(publicKey);
  let verify = util.verify(content, localSign, fPublicKey);
  if (!verify) {
    res.sendStatus(400);
    return;
  }
  let keypair = util.generate();
  let signature = util.sign(localSign, keypair.privateKey);
  let hash = util.toHex(util.sha256(util.decode64(signature)));
  let pem = util.keypairToPem(keypair);
  let md5 = util.toHex(util.md5(fPublicKey.n.toString()));
  let folder = path.resolve(dataDir, md5);
  save(v2Id, folder, 'v2Id');
  save(nsCode, folder, 'nsCode');
  save(email, folder, 'email');
  save(content, folder, 'content');
  save(localSign, folder, 'localSign');
  save(publicKey, folder, 'localPublicKey');
  save(signature, folder, 'serverSign');
  save(hash, folder, 'serverSignHash');
  save(pem.privateKey, folder, 'serverPrivateKey');
  save(pem.publicKey, folder, 'serverPublicKey');
  save(md5, dataDir, 'v2Id', util.toHex(util.md5(v2Id)));
  save(md5, dataDir, 'nsCode', util.toHex(util.md5(nsCode)));
  save(md5, dataDir, 'hash', util.toHex(util.md5(hash)));
  res.send({
    publicKey: pem.publicKey,
    signature
  });
});

module.exports = router;