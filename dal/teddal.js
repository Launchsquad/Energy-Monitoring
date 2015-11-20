var _ = require('underscore');
var http = require('http');
var parsexmlString = require('xml2js').parseString;

var self = {
  getlive: function(ted_device, callback) {

    var get_options = {
      protocol: 'http:',
      hostname: ted_device.hostname,
      path: ted_device.livedata.path,
      method: 'GET',
      headers: {}
    };

    // Set up the request
    var post_req = http.request(get_options, function(xmlres) {
      var xml_chunk = "";

      xmlres.setEncoding('utf8');
      xmlres.on('data', function(chunk) {
        xml_chunk += chunk;
      });

      xmlres.on('end', function() {
        parsexmlString(xml_chunk, function(err, result) {
          callback(null, result.LiveData);
        });
      });
    });

    // post the params
    post_req.write(JSON.stringify({}));
    post_req.end();

    post_req.on('error', function(err) {
      console.log("ERR", err);
      callback(err);
    });
  },

  getsecond: function(ted_device, callback) {

    var get_options = {
      protocol: 'http:',
      hostname: ted_device.hostname,
      path: ted_device.secondhistory.path + '?MTU=' + ted_device.secondhistory.mtuids[0] + '&COUNT=80&INDEX=0', //hard-coding COUNT and INDEX
      method: 'GET',
      headers: {}
    };

    // Set up the request
    var post_req = http.request(get_options, function(res) {
      var xml_chunk = "";

      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        xml_chunk += chunk;
      });

      res.on('end', function() {
        parsexmlString(xml_chunk, function(err, result) {
          callback(result.History);
        });
      });

      // post the params
      post_req.write(JSON.stringify({}));
      post_req.end();
    });
  }
};

module.exports = self;
