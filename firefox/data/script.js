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
				signedEncryptedToken = openpgp.signAndEncryptMessage(serverPubkey, userPrivkey, token)

			window.postMessage("cryptoauth:requestLogin:"+btoa(encryptedUserPubkey+"|"+signedEncryptedToken), '*')

			break;

	}

}, false)

self.port.on("requestToken", function(privKey) {

	userPrivkey = openpgp.key.readArmored(privKey).keys[0]
	userPrivkey.decrypt("pwd")
	userPubkey = userPrivkey.toPublic()

	encryptedUserPubkey = openpgp.encryptMessage(serverPubkey, userPubkey.armor())

	window.postMessage("cryptoauth:requestToken:"+btoa(encryptedUserPubkey), '*')

})