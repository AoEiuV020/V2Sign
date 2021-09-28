var express = require('express');
var router = express.Router();
var forge = require('node-forge');
var utils = require('../public/utils');

router.post('/upload', async function(req, res) {
  let data = req.body;
  console.log(data);
  let keypair = await utils._generate();
  let signature = await utils._sign(data.ls, keypair.privateKey);
  res.send(signature);
});

module.exports = router;
