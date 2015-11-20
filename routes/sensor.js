var ilxserver = require('./ilxserver');

var self = {
  getAllSensor: function(req, res) {

    var params = {
      'fields': ['id', 'SensorID'],
      'filters': []
    };

    ilxserver.getsensors(params, function(err, sensorsettings) {
      console.log("ilxserver err", err);
      console.log("ilxserver sensorsettings", sensorsettings);
      if (err) {
        res.status("500").send({ autherror: err });
      } else {
        res.send(sensorsettings);
      }
    });
  }
};

module.exports = self;
