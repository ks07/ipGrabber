ipGrabber
=========

A very simple poor-man's ddns server, using Node.JS and Redis.

Installation
============
Simply download a copy of the repository and install dependencies with `npm install`. You can then run the server using 
`node index.js`.

The script should run with a default Redis installation out of the box. If you need to modify any settings, you can find 
the relevant constants at the top of the file.

Retrieving Latest IP
====================
To grab the last seen IP, you can invoke the script with the `-get` option.

`node index.js -get`

Updating IP
===========
The history of IPs is updated for every HTTP GET request for the root of the server. The server listens on port 2626 by 
default. You can perform this GET request using any HTTP client. For example, using cURL from the command line:

`curl -so /dev/null "http://example.com:2626/"`

You should use your operating system's task scheduler to run this at regular intervals.

Simple Password Support
=======================
You may enable simple passport support in order to prevent unwanted IPs being added to the log. Please be aware that the
 password will be sent in plaintext, unless you modify the server to use HTTPS. This is mainly intended to prevent 
accidental access by webcrawlers.

Simply invoke the server with a password parameter:

`node index.js -p <password>`

The password will be expected as part of a urlencoded POST body. This can be sent using cURL:

`curl -d 'pass=<password' -so /dev/null "http://example.com:2626/"`
