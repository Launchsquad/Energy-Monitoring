#!usr/bin/env node
var energymonitoring = require('./app.js');

energymonitoring.run({
    port: process.env.PORT
});
