function CryptoAuth(config) {

	window.postMessage("cryptoauth:available:"+btoa(config.serverPubkey), "*")

	window.addEventListener('message', function(event) {

		var data = event.data.split(':'),
			method = data[1],
			payload = atob(data[2])

		switch(method) {

			case 'requestToken':

				config.requestToken(payload, function(encryptedToken) {
					window.postMessage("cryptoauth:token:"+btoa(encryptedToken), "*")
				})
				break;

			case 'requestLogin':

				payload = payload.split('|')

				var encryptedPubkey = payload[0],
					signedEncryptedToken = payload[1]

				config.requestLogin(encryptedPubkey, signedEncryptedToken)
				break;
		}

        
    }, false)

}