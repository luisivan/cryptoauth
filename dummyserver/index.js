var express = require('express'),
	app = express(),
	crypto = require('crypto'),
	openpgp = require('openpgp'),
	fs = require('fs'),
	pubkey = openpgp.key.readArmored(fs.readFileSync('pubkey.asc', 'utf8')).keys[0],
	privkey = openpgp.key.readArmored(fs.readFileSync('privkey.asc', 'utf8')).keys[0]

privkey.decrypt("")

app.use(express.static(__dirname))

// This would only work for a user at a time, but anyway this is just test code
var user,
	token

app.get('/requestToken', function(req, res) {

	var encryptedUserPubkey = openpgp.message.readArmored(req.query.encryptedPubkey),
		userPubkey = openpgp.key.readArmored(openpgp.decryptMessage(privkey, encryptedUserPubkey)).keys

	token = crypto.randomBytes(16).toString('base64')
	encryptedToken = openpgp.encryptMessage(userPubkey, token)
	
	console.log('Sending token')
  	res.send(encryptedToken)
})

app.post('/requestLogin', function(req, res) {

	var encryptedUserPubkey = openpgp.message.readArmored(req.query.encryptedPubkey),
		userPubkey = openpgp.key.readArmored(openpgp.decryptMessage(privkey, encryptedUserPubkey)).keys

	var signedEncryptedToken = openpgp.message.readArmored(req.query.signedEncryptedToken)
		signedToken = openpgp.decryptAndVerifyMessage(privkey, userPubkey, signedEncryptedToken)

	if (token == signedToken.text && signedToken.signatures.length > 0)
  		res.send(true)
  	else
  		res.send(false)
})

app.listen(3000)