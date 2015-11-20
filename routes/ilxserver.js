var _ = require('underscore');
var fs = require('fs');
var ilxserverdal = require('../dal/ilxserverdal');


var self = {

  getsensors: function(params, callback) {
    console.log("getsensors", params);

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);

      ilxserverdal.get(
        params,
        conf.connections.intelex.auth,
        conf.connections.intelex.hostname,
        conf.connections.intelex.basicselect,
        'GetRecordsByFilter',
        'EnergMonitoring_SensorObject',
        callback
      );
    });
  },

  getcosts: function(params, callback) {
    console.log("getcosts");

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);

      ilxserverdal.get(
        params,
        conf.connections.intelex.auth,
        conf.connections.intelex.hostname,
        conf.connections.intelex.basicselect,
        'GetRecordsByFilter',
        'EnergMonitoring_ElCostperPeriodObject',
        callback
      );
    });
  },

  getsettings: function(params, callback) {
    console.log("getsettings");

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);

      ilxserverdal.get(
        params,
        conf.connections.intelex.auth,
        conf.connections.intelex.hostname,
        conf.connections.intelex.basicselect,
        'GetRecordsByFilter',
        'EnergMonitoring_MonitoriSettingObject',
        callback
      );
    });
  },

  getenergyschema: function(callback) {
    console.log("getenergyschema");

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);

      ilxserverdal.checkAuth(
        {},
        conf.connections.intelex.auth,
        conf.connections.intelex.hostname,
        conf.connections.intelex.schema,
        'GetSchemaBySystemName',
        'EnergMonitoring_MonitoriSettingObject',
        callback
      );
    });
  },

  postrecord: function(params, callback) {
    console.log("postrecord", JSON.stringify(params));

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);

      ilxserverdal.post(
        params,
        conf.connections.intelex.auth,
        conf.connections.intelex.hostname,
        conf.connections.intelex.datamanager,
        'InsertRecord',
        'EnergMonitoring_MonitorinRecordObject',
        callback
      );
    });
  },

  checkauth: function(auth, callback) {
    console.log("checkauth");

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);

      ilxserverdal.checkAuth(
        {},
        auth,
        conf.connections.intelex.hostname,
        conf.connections.intelex.schema,
        'GetSchemaBySystemName',
        'SysEmployeeEntity',
        callback
      );
    });
  }
};


module.exports = self;
