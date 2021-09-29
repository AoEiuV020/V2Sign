var express = require('express');
var router = express.Router();
var util = require('../public/util');
var fs = require('fs');
var path = require("path");

var dataDir = process.env.dataDir || './data';
console.log('dataDir: ' + path.resolve(dataDir));

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
  let content = v2Id + nsCode + email;
  let verify = util.verify(content, localSign, util.publicKeyFromPem(publicKey));
  if (!verify) {
    res.sendStatus(400);
    return;
  }
  let keypair = util.generate();
  let signature = util.sign(localSign, keypair.privateKey);
  let pem = util.keypairToPem(keypair);
  let md5 = util.toHex(util.md5(util.decode64(signature)));
  let folder = path.resolve(dataDir, md5);
  fs.mkdirSync(folder, {
    recursive: true
  });
  fs.writeFileSync(path.resolve(folder, 'v2Id'), v2Id);
  fs.writeFileSync(path.resolve(folder, 'nsCode'), nsCode);
  fs.writeFileSync(path.resolve(folder, 'email'), email);
  fs.writeFileSync(path.resolve(folder, 'content'), content);
  fs.writeFileSync(path.resolve(folder, 'localSign'), localSign);
  fs.writeFileSync(path.resolve(folder, 'publicKey'), publicKey);
  fs.writeFileSync(path.resolve(folder, 'sPrivateKey'), pem.privateKey);
  fs.writeFileSync(path.resolve(folder, 'sPublicKey'), pem.publicKey);
  res.send(signature);
});

module.exports = router;