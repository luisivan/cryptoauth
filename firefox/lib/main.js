var data = require("sdk/self").data,
	buttons = require('sdk/ui/button/action'),
	tabs = require("sdk/tabs"),
	pageMod = require("sdk/page-mod"),
	file = require("sdk/io/file"),
	worker = null

// Only for development
tabs.open('http://localhost:3000')

// Button stuff
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

  		worker.port.emit("requestToken", privKey)

  	}
})

// This should be done using DnD to the button or something
var privKey = file.read("/home/li/dev/cryptoauth/userprivkey.asc")

// Add the scripts to each page
pageMod.PageMod({
  	include: ["*", "file:///*"],
  	contentScriptFile: [data.url("openpgp.min.js"), data.url("script.js")],
	onAttach: function(w) {

		worker = w

	    worker.port.on("available", function() {

	    	console.log('Cryptoauth available')
	      	button.state("tab", { disabled: false })

	    })
	}
})