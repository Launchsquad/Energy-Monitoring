var _ = require('underscore');
var fs = require('fs');
var ilxserver = require('./ilxserver');

var self = {
  getStatus: function(req, res) {
    fs.readFile('./conf/conf.json', 'ascii', function(err, returned_conf) {
      if (err) {
        res.status("500").send({ autherror: err });
      } else {
        res.send(JSON.parse(returned_conf));
      }
    });
  },

  start: function(req, res) {

    fs.readFile('./conf/conf.json', 'ascii', function(err, returned_conf) {
      var conf = JSON.parse(returned_conf);

      //write auth to file
      conf.active = true;

      fs.writeFile('./conf/conf.json', JSON.stringify(conf), function(err, conf_return) {
        if (err) {
          res.status("500").send({ autherror: err });
        } else {
          res.send({});
        }
      });
    });
  },

  stop: function(req, res) {
    fs.readFile('./conf/conf.json', 'ascii', function(err, returned_conf) {
      var conf = JSON.parse(returned_conf);

      //write auth to file
      conf.active = false;

      fs.writeFile('./conf/conf.json', JSON.stringify(conf), function(err, conf_return) {
        if (err) {
          res.status("500").send({ autherror: err });
        } else {
          res.send({});
        }
      });
    });
  }
};

module.exports = self;
