var fs = require('fs'),
	crypto = require('crypto'),
	openpgp = require('openpgp'),
	express = require('express'),
	levelup = require('levelup')

var pubkey = openpgp.key.readArmored(fs.readFileSync('pubkey.asc', 'utf8')).keys[0],
	privkey = openpgp.key.readArmored(fs.readFileSync('privkey.asc', 'utf8')).keys[0]
	
privkey.decrypt("")

var app = express()
app.use(express.static(__dirname))

var db = levelup('./database')

var key = openpgp.key.readArmored(fs.readFileSync('userpubkey.asc', 'utf8')).keys[0].armor(),
	binaryHash = openpgp.crypto.hash.digest(openpgp.enums.hash.ripemd, key),
	hash = new Buffer(binaryHash, 'binary').toString('base64')

/*console.log('\n')
console.log(key)
console.log('\n')
console.log(key.length)
console.log(binaryHash)
console.log(hash)
*/
db.put('hEx5QF1XcsvTjv/pG9pGIfc+aQY=', key)


/*app.post('/requestSignup', function(req, res) {

	encryptedUserPubkey = openpgp.message.readArmored(req.query.encryptedPubkey)
	userPubkey = openpgp.key.readArmored(openpgp.decryptMessage(privkey, encryptedUserPubkey)).keys

	console.log("Signed up")
	userPubkeyArmor = userPubkey[0].armor()
	var hashedUserPubkey = openpgp.crypto.hash.digest(openpgp.enums.hash.ripemd, userPubkeyArmor)
	db.put(hashedUserPubkey, userPubkeyArmor)

	token = crypto.randomBytes(16).toString('base64')
	encryptedToken = openpgp.encryptMessage(userPubkey, token)
	
	console.log('Sending token')
  	res.json({token: encryptedToken})
})*/

app.get('/requestToken', function(req, res) {

	var hashedPubkey = req.query.hashedPubkey

	db.get(hashedPubkey, function(err, userPubkey) {

		var userPubkey = openpgp.key.readArmored(userPubkey)

		var token = crypto.randomBytes(16).toString('base64'),
			encryptedToken = openpgp.encryptMessage(userPubkey.keys, token)

		db.put(hashedPubkey+"-token", token)
		
		console.log('Sending token')
	  	res.json({encryptedToken: encryptedToken})
	})

})

/*app.post('/requestLogin', function(req, res) {

	console.log(req.query.signedEncryptedToken)

	var signedEncryptedToken = openpgp.message.readArmored(req.query.signedEncryptedToken)
		signedToken = openpgp.decryptAndVerifyMessage(privkey, userPubkey, signedEncryptedToken)

	console.log(token)
	console.log(signedToken)

	if (token == signedToken.text && signedToken.signatures.length > 0)
  		res.json({logged: true})
  	else
  		res.json(401, {logged: false})
})*/

var armoredSignatureTmpl = ["-----BEGIN PGP SIGNED MESSAGE-----",
							"Hash: SHA256",
							'',
							'{{token}}',
							'-----BEGIN PGP SIGNATURE-----',
							'Version: OpenPGP.js v0.6.0',
							'Comment: http://openpgpjs.org',
							'',
							'{{tokenSignature}}',
							'-----END PGP SIGNATURE-----'].join("\n")

app.post('/requestLogin', function(req, res) {

	var hashedPubkey = req.query.hashedPubkey,
		tokenSignature = req.query.tokenSignature

	db.get(hashedPubkey, function(err, userPubkey) {

		var userPubkey = openpgp.key.readArmored(userPubkey)

		db.get(req.query.hashedPubkey+"-token", function(err, token) {

			var armoredSignature = armoredSignatureTmpl.replace("{{token}}", token).replace("{{tokenSignature}}", tokenSignature)

			var signedToken = openpgp.verifyClearSignedMessage(userPubkey.keys, openpgp.cleartext.readArmored(armoredSignature))

			if (token == signedToken.text && signedToken.signatures.length > 0)
		  		res.json({logged: true})
		  	else
		  		res.json(401, {logged: false})

		})

	})
})



app.listen(3000)