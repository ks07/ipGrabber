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

    // Setup the root API endpoint.
    app.get('/', function(req,res) {
        var ip = req.ip;
        rcli.lpush(rPfix + "iplog", ip, redis.print);
        rcli.ltrim(rPfix + "iplog", 0, 99, redis.print);
        
        res.send(200, 'OK');
    });

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
