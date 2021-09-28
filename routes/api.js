var express = require('express');
var router = express.Router();
var utils = require('../public/utils');
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
  let md5 = utils._toHex(utils._md5(utils._decode64(localSign)));
  let folder = path.resolve(dataDir, md5);
  fs.mkdirSync(folder, {
    recursive: true
  });
  fs.writeFileSync(path.resolve(folder, 'v2Id'), v2Id);
  fs.writeFileSync(path.resolve(folder, 'nsCode'), nsCode);
  fs.writeFileSync(path.resolve(folder, 'email'), email);
  fs.writeFileSync(path.resolve(folder, 'localSign'), localSign);
  fs.writeFileSync(path.resolve(folder, 'publicKey'), publicKey);
  let keypair = utils._generate();
  let signature = utils._sign(localSign, keypair.privateKey);
  res.send(signature);
});

module.exports = router;