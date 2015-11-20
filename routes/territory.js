var fs = require('fs');
var ilxserver = require('./ilxserver');

var self = {
  getAllTerritory: function(req, res) {

    var params = {
      'fields': ['id', 'CostSettings', 'CostSettings.id', 'SettingID', 'HourlPowerLimit', 'AssociatSensors.id'],
      'filters': []
    };

    ilxserver.getsettings(params, function(err, territory_settings) {
      if (err) {
        res.status("500").send({ autherror: err });
      } else {
        res.send(territory_settings);
      }
    });
  },

  getCurrent: function(req, res) {

    fs.readFile('./conf/conf.json', 'ascii', function(err, returned_conf) {
      var conf = JSON.parse(returned_conf);

      console.log("current Territory", conf.territory);
      res.send({"territory": conf.territory});
    });
  },

  setCurrent: function(req, res) {

    fs.readFile('./conf/conf.json', 'ascii', function(err, returned_conf) {

      var conf = JSON.parse(returned_conf);
      conf.territory = req.body.territory;

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
