function CryptoAuth(config) {

	window.cryptoauth = config

	window.addEventListener('message', function(event) {

		var data = event.data.split(':'),
			method = data[1],
			payload = data[2]

		switch(method) {

			case 'isAvailable':

				window.postMessage("cryptoauth:available:"+cryptoauth.serverPubkey, "*")
				break;

			case 'requestToken':

				cryptoauth.requestToken(payload, function(encryptedToken) {
					window.postMessage("cryptoauth:token:"+encryptedToken, "*")
				})
				break;

			case 'requestLogin':

				payload = payload.split(';')

				var encryptedPubkey = payload[0],
					signedToken = payload[1]

				cryptoauth.requestLogin(encryptedPubkey, signedToken)
				break;
		}

        
    }, false)

}