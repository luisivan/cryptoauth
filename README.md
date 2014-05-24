cryptoauth
==========

Public-key cryptography for the web

Crazy security, OpenPGP, all under 1kb of data transmitted per login

Flow
-----

1. Install Cryptoauth extension

2. Visit website that supports it. Cryptoauth goes enabled

3. Click on cryptoauth

Signup
-----

4. It sends the user's pubkey encrypted using the server's pubkey. The server stores the pubkey and the RIPEMD-160 hash of it

Login
-----

4. It sends the RIPEMD-160 hash of the user's pubkey

Common
-----

5. The server replies with a token encrypted using the user's pubkey. It has linked that token with the user's pubkey

6. The browser unencrypts it, signs the token using the user's privkey and sends only the signature portion and the RIPEMD-160 hash of the user's pubkey to the server

7. The server gets the user's pubkey using the RIPEMD-160 hash, verifies the signature coupling it to the token and logs the user in. The token used before could also be used as the session secret as it always travels encrypted over the network

Data size
-----

In the logging process, the following data is sent/received:

- User's hashed pubkey (28 bytes) (Sent)
- Encrypted token (~585 bytes) (Received)
- User's hashed pubkey (28 bytes), token's signature (390 bytes) (Sent)

That's ~1kb per login, which is way larger than a traditional login, but it has some benefits

Why this system rocks
-----

1. You won't ever care about passwords or usernames again. You just click a button and you're logged in

2. Cryptoauth is secure, whether the server uses SSL or not. No one can steal your session token (only you can decrypt it) and even no one knows your public key, so this is quantum computers-safe

3. Cryptoauth runs as a browser extension so it's completely isolated from the websites you visit. No one can steal your keys