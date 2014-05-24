var serverPubkey,
	userPubkey,
	userPrivkey,
	encryptedUserPubkey

window.addEventListener('message', function(event) {

	var data = event.data.split(':'),
		method = data[1],
		payload = atob(data[2])

	switch(method) {

		case 'available':

			// Payload is server's pubkey
			serverPubkey = openpgp.key.readArmored(payload).keys
			self.port.emit('available')
			break;

		case 'token':

			// Payload is encrypted token, unencrypt and sign it
			var token = openpgp.decryptMessage(userPrivkey, openpgp.message.readArmored(payload)),
				signedToken = openpgp.signClearMessage([userPrivkey], token)

			var startStr = 'Comment: http://openpgpjs.org',
				endStr = '-----END PGP SIGNATURE-----'

			var tokenSignature = signedToken.substring(signedToken.indexOf(startStr)+startStr.length, signedToken.indexOf(endStr))

			window.postMessage("cryptoauth:requestLogin:"+btoa(userHashedPubkey+"|"+tokenSignature), '*')

			break;

	}

}, false)

/*self.port.on("requestToken", function(privKey) {

	userPrivkey = openpgp.key.readArmored(privKey).keys[0]
	userPrivkey.decrypt("pwd")
	userPubkey = userPrivkey.toPublic()

	encryptedUserPubkey = openpgp.encryptMessage(serverPubkey, userPubkey.armor())

	window.postMessage("cryptoauth:requestToken:"+btoa(encryptedUserPubkey), '*')

})*/

// Has to send the privkey each time for each page because Openpgpjs can't run in main.js
self.port.on("requestToken", function(privKey) {

	userPrivkey = openpgp.key.readArmored(privKey).keys[0]
	userPrivkey.decrypt("pwd")
	userPubkey = userPrivkey.toPublic().armor()
	userHashedPubkey = btoa(openpgp.crypto.hash.digest(openpgp.enums.hash.ripemd, userPubkey))

	//encryptedUserPubkey = openpgp.encryptMessage(serverPubkey, userPubkey)

	window.postMessage("cryptoauth:requestToken:"+btoa(userHashedPubkey), '*')

})

