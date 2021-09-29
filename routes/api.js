var express = require('express');
var router = express.Router();
var util = require('../public/util.js');
var fs = require('fs');
var path = require("path");

var dataDir = process.env.dataDir || './data';
var keyDir = process.env.keyDir || path.resolve(dataDir, 'keys');

function save(text, ...pathSegments) {
  let file = path.resolve(...pathSegments);
  fs.mkdirSync(path.dirname(file), {
    recursive: true
  })
  fs.writeFileSync(file, text);
}

function load(...pathSegments) {
  let file = path.resolve(...pathSegments);
  if (fs.existsSync(file)) {
    return fs.readFileSync(file).toString();
  }
}

var keypair;
var pem = {
  privateKey: load(keyDir, 'privateKey'),
  publicKey: load(keyDir, 'publicKey')
}
if (!pem.privateKey || !pem.publicKey) {
  keypair = util.generate();
  pem = util.keypairToPem(keypair);
  save(pem.privateKey, keyDir, 'privateKey');
  save(pem.publicKey, keyDir, 'publicKey');
} else {
  keypair = {
    privateKey: util.privateKeyFromPem(pem.privateKey),
    publicKey: util.publicKeyFromPem(pem.publicKey)
  }
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
  if (fPublicKey.n.bitLength() < util.bits) {
    res.sendStatus(400);
    return;
  }
  let verify = util.verify(content, localSign, fPublicKey);
  if (!verify) {
    res.sendStatus(400);
    return;
  }
  let signature = util.sign(localSign, keypair.privateKey);
  let hash = util.toHex(util.sha256(util.decode64(signature)));
  let md5 = util.toHex(util.md5(fPublicKey.n.toString()));
  let folder = path.resolve(dataDir, md5);
  save(hash, folder, 'hash');
  save(v2Id, folder, 'v2Id');
  save(nsCode, folder, 'nsCode');
  save(email, folder, 'email');
  save(content, folder, 'content');
  save(localSign, folder, 'localSign');
  save(publicKey, folder, 'localPublicKey');
  save(signature, folder, 'serverSign');
  save(req.ip, folder, 'ip');
  save(req.headers['user-agent'], folder, 'ua');
  save(md5, dataDir, 'hash', util.toHex(util.md5(hash)));
  save(md5, dataDir, 'v2Id', util.toHex(util.md5(v2Id)));
  save(md5, dataDir, 'nsCode', util.toHex(util.md5(nsCode)));
  save(md5, dataDir, 'email', util.toHex(util.md5(email)));
  res.send({
    publicKey: pem.publicKey,
    signature,
    weChat: process.env.WE_CHAT || '',
    qrCode: process.env.QR_CODE || '',
  });
});

router.post('/query', async function (req, res) {
  let data = req.body;
  console.log(data);
  let {
    key,
    value
  } = data;
  if (!key || !value) {
    res.sendStatus(400);
    return;
  }
  if (!['hash', 'nsCode', 'v2Id', 'email'].includes(key)) {
    res.sendStatus(400);
    return;
  }
  value = util.decode64(value);
  try {
    value = util.rsaDecrypt(value, keypair.privateKey);
  } catch (e) {
    // 用户保存的服务器公钥错误，
    res.sendStatus(400);
    return;
  }
  try {
    value = util.aesDecrypt(value, process.env.PASSWORD);
  } catch (e) {
    // 密码错误，
    res.sendStatus(400);
    return;
  }
  switch (key) {
    case 'v2Id':
      value = value.replace(/\s/g, '');
      break;
    case 'nsCode':
      value = value.replace(/[^\d]/g, '');
      break;
    case 'email':
      value = value.replace(/\s/g, '');
      break;
  }
  value = util.toHex(util.md5(value));
  let md5 = load(dataDir, key, value);
  if (!md5) {
    res.sendStatus(404);
    return;
  }
  let body = {
    hash: load(dataDir, md5, 'hash'),
    v2Id: load(dataDir, md5, 'v2Id'),
    nsCode: load(dataDir, md5, 'nsCode'),
    email: load(dataDir, md5, 'email'),
  }

  res.send(body);
});

module.exports = router;