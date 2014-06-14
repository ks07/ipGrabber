#!/usr/bin/env node

/**
 * Config values
 */
var lPort = '2626';
var rPort = '6379';
var rHost = 'localhost';
var rPfix = 'ipGrabber:';

/**
 * Imports and redis client
 */
var express = require('express');
var redis = require('redis');
var rcli = redis.createClient('6379', 'localhost');

rcli.on('error', function (err) {
    console.log('Redis Error: ' + err);
});

/**
 * Logs error, if present.
 */
function eLog(err) {
    if (err) {
        console.log('Redis Error: ' + err);
    }
}

/**
 * Push the IP to the front of the list.
 */
function storeIP(ip) {
    rcli.lpush(rPfix + "iplog", ip, eLog);
    rcli.ltrim(rPfix + "iplog", 0, 99, eLog);
}

// If ran in fetch mode, return the last ip and quit.
if (process.argv.length > 2 && process.argv[2] === '-get') {
    return rcli.lrange(rPfix + "iplog", 0, 0, function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log(res[0]);
        }
        return rcli.quit();
    });
} else {
    // Init express application
    var app = express();

    // Configure Express to use the various middleware we require.
    app.configure(function() {
        // Enable the request logger, with dev formatting.
        app.use(express.logger());
        // Enable the dynamic request router.
        app.use(app.router);
    });

    // If ran with a password parameter, only respond to POST requests supplying the matching passphrase.
    if (process.argv.length > 3 && process.argv[2] === '-p') {
        var pass = process.argv[3];

        app.post('/', express.urlencoded(), function(req,res) {
            if (req.body.pass === pass) {
                storeIP(req.ip);
                res.send(200, 'OK');
            } else {
                res.send(403, 'FAIL');
            }
        });
    } else {
        app.get('/', function(req,res) {
            storeIP(req.ip);
            res.send(200, 'OK');
        });
    }

    /**
     * The port the server will listen on.
     * This will be taken from the PORT environment variable if possible, else it will default to 2626.
     */
    var port = process.env.PORT || lPort;

    // Start the server.
    app.listen(port, function() {
        return console.log("Listening on " + port);
    });
}
