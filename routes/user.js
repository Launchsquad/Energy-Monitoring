var _ = require('underscore');
var fs = require('fs');
var ilxserver = require('./ilxserver');

var self = {
  checkAuth: function(req, res) {

    fs.readFile('./conf/conf.json', 'ascii', function(err, returned_conf) {
      var conf = JSON.parse(returned_conf);

      //If none passed in, test what's already been saved
      var userpass = req.query.userpass || conf.connections.intelex.auth;

      ilxserver.checkauth(userpass, function(schema_err, returned_schema) {

        if (schema_err) {
          res.status("500").send({ installerror: schema_err });
        } else {
        
          var error = "";

          try {
            returned_schema = JSON.parse(returned_schema);
            var field_names = _.pluck(returned_schema, "Name");

            if (!(_.contains(field_names, "EmployeeType"))) {
              error = "Auth Failed";
            }
          }
          catch(err) {
            error = err;
          }
          finally {
            if (error) {
              res.status("500").send({ autherror: 'Auth Failed' });
            } else {

              //write auth to file
              conf.connections.intelex.auth = userpass;

              fs.writeFile('./conf/conf.json', JSON.stringify(conf), function(err, conf_return) {
                if (err) {
                  res.status("500").send({ autherror: err });
                } else {
                  res.send({});
                }
              });
            }
          }
        }
      });
    });
  },

  checkInstalled: function(req, res) {

    ilxserver.getenergyschema(function(schema_err, returned_schema) {

      if (schema_err) {
        res.status("500").send({ installerror: schema_err });
      } else {

        var error = "";

        try {
          returned_schema = JSON.parse(returned_schema);
          var field_names = _.pluck(returned_schema, "Name");

          if (!(_.contains(field_names, "CostSettings"))) {
            error = "Auth Failed";
          }
        }
        catch(err) {
          error = err;
        }
        finally {
          if (error) {
            console.log("CHECK INSTALL FAIL");
            res.status("500").send({ installerror: 'Not Installed' });
          } else {
            console.log("CHECK INSTALL SUCCESS");
            res.send({});
          }
        }
      }
    });
  }
};

module.exports = self;
