var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var compression = require('compression');
var routes = require('./routes');
var http = require('http');
var fs = require('fs');
var URL = require('url');


var app;
var httpApp;
var http_port = 4010;

var server;
var secureserver;

var options;
var store = null;

function run(opts) {
    app = express();
    httpApp = express();

    //Configure app
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: 'false'}));

    // Serving statics from __dirname, not the current working directory, to
    // ensure this script can be run from anywhere and load proper configs.
    app.use(express.static(__dirname + "/public"));
    app.use(methodOverride());
    app.use(compression());

    startServer();
}

function startServer() {

    try {
        routes.bind(app);

        app.listen(http_port, function() {
            console.log("Running server on port %d", http_port);
            routes.initializeService();
        });

    } catch(e) {
        console.log("err", e);
    }
}

module.exports = {
    run: run
};
