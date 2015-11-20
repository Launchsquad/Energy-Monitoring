var _ = require('underscore');
var schedule = require('node-schedule');
var http = require('http');
var fs = require('fs');

var IlxServer = require('./ilxserver');
var GetSettings = require('./getSettings');
var TedData = require('./TedData');
var initialize = require('./initialize');

var global_territory = "Ontario";


function initializeService() {
  console.log("Initializing Service");

  var get_settings = {}; //e.g. {settingid: {hourly_rates: [], hourly_limit: '', time_interval: 60, sensorids: [mtuid]}}

  var rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0,6)]; //push every day of the week
  //rule.hour = 19;
  //rule.minute = 0;
  //default interval is every minute


  //if conf file doesn't exist
    // initialize it!
  //else
    //proceed on as normal

  initialize(function() {

    //every minute, keep pulling in data from TED system for each MTU ID
    var j = schedule.scheduleJob(rule, function() {

      fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
        conf = JSON.parse(conf);

        if (conf.active) {
          //Do initial Settings pull to get all the Sensor IDs (actually the MTU IDs)
          GetSettings(get_settings, function() {
            //console.log("get_settings", get_settings);

            var hourly_readings = [];  //stores all the data from TED system

            var currentDateTime = new Date();
            query_minute = currentDateTime.getMinutes() - 1;

            TedData.GetSecondHistory(get_settings, conf.territory, query_minute, function(new_record) {

              //keep an hourly count of total power and min/max power readings
              hourly_readings.push(new_record);
              //console.log("hourly_readings", hourly_readings);
              console.log("New Record created");

              if ((currentDateTime.getMinutes() + 1) % 60 === 0) {

                SendData(hourly_readings, function() {
                  //reset hourly_readings for next loop
                  hourly_readings = [];
                });
              }
            });
          });
        }
      });
    });
  });
}


//Prep data and send to Intelex
function SendData(hourly_readings, callback) {
  var base_record = hourly_readings[0];

  var total_cost = 0;
  var total_power = 0;
  var max_power = 0;
  var min_power = 0;

  var recordedDate = new Date(
    parseInt(base_record.Year) + 2000,
    parseInt(base_record.Month) - 1,
    parseInt(base_record.Day),
    parseInt(base_record.Hour), //save for this current hour (not the next)
    0, 0, 0 //minutes, seconds, milliseconds
  );


  _.each(_.pluck(base_record.Mtus, "Mtu"), function(indivMtuID) {

    _.each(hourly_readings, function(indivRecord) {

      var mtu_record = _.where(indivRecord.Mtus, {"Mtu": indivMtuID})[0];

      total_cost += mtu_record.Cost;
      total_power += mtu_record.Power;

      max_power = _.max([max_power, mtu_record.Power]);
      min_power = _.min([max_power, mtu_record.Power]);
    });


    var data = {
      'list': [{
        'Name': 'HourlyCost',
        'Value': total_cost,
      }, {
        'Name': 'RecoDateandTime',
        'Value': recordedDate,
      }, {
        'Name': 'Power',
        'Value': total_power,
      }, {
        'Name': 'SensorID',
        'Value': indivMtuID,
      //}, {
        //'Name': 'LimitExceeded',
        //'Value': limitExceeded,//''
      }, {
        'Name': 'MMeasurementkWh',
        'Value': max_power,
      }, {
        'Name': 'MinMeasuremtkWh',
        'Value': min_power,
      }]
    };

    //Post Monitor Record!!!;
    IlxServer.postrecord(data, function(response_data) {
      console.log('POST Response: ', JSON.stringify(response_data));
    });
  });

  callback();
}


function bind(app) {
  var sensor = require('./sensor');
  var service = require('./service');
  var territory = require('./territory');
  var ted = require('./ted');
  var user = require('./user');


  app.get('/', ensureAuthenticated, function(res, req) { res.send(req.user); });

  app.get('/api/sensor/all', ensureAuthenticated, sensor.getAllSensor);

  app.get('/api/service', ensureAuthenticated, service.getStatus);
  app.post('/api/service/start', ensureAuthenticated, service.start);
  app.post('/api/service/stop', ensureAuthenticated, service.stop);

  app.get('/api/territory/all', ensureAuthenticated, territory.getAllTerritory);
  app.get('/api/territory/current', ensureAuthenticated, territory.getCurrent);
  app.post('/api/territory/current', ensureAuthenticated, territory.setCurrent);

  app.get('/api/ted', ensureAuthenticated, ted.getTedData);
  app.get('/api/ted/all', ensureAuthenticated, ted.getAllTed);
  app.post('/api/ted', ensureAuthenticated, ted.setTed);

  app.get('/api/user/auth', ensureAuthenticated, user.checkAuth);
  app.get('/api/user/installed', ensureAuthenticated, user.checkInstalled);
}

function ensureAuthenticated(req, res, next) {
  return next();
}

module.exports = {
    bind: bind,
    initializeService: initializeService
};
