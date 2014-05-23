window.postMessage("cryptoauth:isAvailable", '*')

window.addEventListener('message', function(event) {

	var data = event.data.split(':'),
		method = data[1],
		payload = data[2]

	self.port.emit(method, payload)

}, false)

self.port.on("requestToken", function(encryptedPubkey) {
	window.postMessage("cryptoauth:requestToken:"+encryptedPubkey, '*')
})

self.port.on("requestLogin", function(encryptedPubkey, signedToken) {
	window.postMessage("cryptoauth:requestLogin:"+encryptedPubkey+";"+signedToken, '*')
})

console.log(openpgp)