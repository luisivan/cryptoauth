var data = require("sdk/self").data,
	buttons = require('sdk/ui/button/action'),
	tabs = require("sdk/tabs"),
	pageMod = require("sdk/page-mod"),
	worker = null

tabs.open('file:///home/li/dev/cryptoauth/lib/index.html')

var button = buttons.ActionButton({
  	id: "cryptoauth",
  	label: "Login",
  	icon: {
		"16": "./icon-16.png",
		"32": "./icon-32.png",
		"64": "./icon-64.png"
  	},
  	disabled: true,
  	onClick: function() {
  		worker.port.emit("requestToken", "encryptedpubkey")
  	}
})

pageMod.PageMod({
  	include: ["*", "file:///*"],
  	contentScriptFile: [data.url("openpgp.min.js"), data.url("script.js")],
	onAttach: function(w) {

		worker = w

	    worker.port.on("available", function(serverPubkey) {
	    	console.log('Cryptoauth available')
	      	button.state("tab", {
			    disabled: false
			})
	    })

	    worker.port.on("token", function(encryptedToken) {

	    	//unencrypt and sign token
	    	worker.port.emit("requestLogin", "encryptedpubkey", "signedtoken")

	    })
	}
})