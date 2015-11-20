var _ = require('underscore');
var http = require('http');

var self = {
  get: function(data, auth, hostname, path, opname, objectname, callback) {

    var post_options = {
      protocol: 'http:',
      hostname: hostname,
      path: path + '/' + opname + '/' + objectname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + auth
      }
    };


    // Set up the request
    var post_req = http.request(post_options, function(res) {
      var output = "";

      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        output += chunk;
      });
      res.on('end', function() {
        callback(null, utils.parseGetRequest(output));
      });
    });

    // post the data
    post_req.write(JSON.stringify(data));
    post_req.end();

    post_req.on('error', function(err) {
      console.log("ERR", err);
      callback(err);
    });
  },

  post: function(data, auth, hostname, path, opname, objectname, callback) {

    var post_options = {
      protocol: 'http:',
      hostname: hostname,
      path: path + '/' + opname + '/' + objectname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + auth
      }
    };


    // Set up the request
    var post_req = http.request(post_options, function(res) {
      var output = "";

      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        output += chunk;
      });
      res.on('end', function() {
        callback(null, output);
      });
    });

    // post the data
    post_req.write(JSON.stringify(data));
    post_req.end();

    post_req.on('error', function(err) {
      console.log("ERR", err);
      callback(err);
    });
  },

  checkAuth: function(data, auth, hostname, path, opname, objectname, callback) {

    var post_options = {
      protocol: 'http:',
      hostname: hostname,
      path: path + '/' + opname + '/' + objectname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + auth
      }
    };


    // Set up the request
    var post_req = http.request(post_options, function(res) {
      var output = "";

      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        output += chunk;
      });
      res.on('end', function() {
        callback(null, output);
      });
    });

    // post the data
    post_req.write(JSON.stringify(data));
    post_req.end();

    post_req.on('error', function(err) {
      console.log("ERR", err);
      callback(err);
    });
  }
};

var utils = {
  parseGetRequest: function(data) {

    /*{ //EXAMPLE OF 'data'
      "ExtensionData":{},
      "Column":[{ "ExtensionData":{}, "Name":"Cost" },
        { "ExtensionData":{}, "Name":"TimeInterval" }],
      "Row":[{ "ExtensionData":{}, "Cell":["0.1","1 Hour"] },
        { "ExtensionData":{}, "Cell":["0.25","1 Hour"] }],
      "TotalRecordCount":2
    }*/

    var output = [];
    if (data[0] == "{" || data[0] == "[") {
      //actually a JSON object, proceed to parse
      data = JSON.parse(data);

      _.each(data.Row, function(indivRow) {
        var indivOutput = {};

        for (var i = 0; i < data.Column.length; i++) {
          indivOutput[data.Column[i].Name] = indivRow.Cell[i];
        }
        output.push(indivOutput);
      });
    } else {
      //error occurred, return as is
      output = data;
    }

    return output;
  }
};

module.exports = self;
