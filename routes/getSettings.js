var IlxServer = require('./ilxserver');
var _ = require('underscore');

var self = {
  getSettings: function(get_settings, callback) {
    self.GetMonitorSettings(get_settings, callback);
  },

  GetMonitorSettings: function(get_settings, callback) {
    var params = {
      'fields': ['id', 'CostSettings', 'CostSettings.id', 'SettingID', 'HourlPowerLimit', 'AssociatSensors.id'],//'HourlPowerLimit'
      'filters': []
    };

    IlxServer.getsettings(params, function(err, chunk) {

      //ignore time interval for now

      var uniq_territoryids = _.uniq(_.pluck(chunk, "SettingID"));

      _.each(uniq_territoryids, function(indivTerritoryID) {

        var subset = _.where(chunk, {"SettingID": indivTerritoryID});

        get_settings[indivTerritoryID] = {
          '_sensorids': _.uniq(_.pluck(subset, "AssociatSensors.id")), //'AssociatSensors' being the Intelex system name of field
          'costsettingsids': _.uniq(_.pluck(subset, "CostSettings.id")),
          'hourly_limit': subset[0].HourlPowerLimit //should be constant for entire territory
        };
      });

      self.GetSensorSettings(get_settings, callback);
    });
  },


  GetSensorSettings: function(get_settings, callback) {
    var params = {
      'fields': ['id', 'SensorID'],
      'filters': []
    };

    IlxServer.getsensors(params, function(err, sensorsettings) {

      _.each(Object.keys(get_settings), function(indivTerrID) {

        var _sensorids = get_settings[indivTerrID]._sensorids;
        get_settings[indivTerrID].sensorids = {};

        var sensor_obj = {};
        _.each(_sensorids, function(indivSensor_id) {

          var indivSensor = _.where(sensorsettings, {"id": indivSensor_id})[0];

          sensor_obj[indivSensor.SensorID] = indivSensor_id;
        });

        get_settings[indivTerrID].sensorids = sensor_obj;
      });

      self.GetCostSettings(get_settings, callback);
    });
  },


  GetCostSettings: function(get_settings, callback) {
    var params = {
      'fields': ['id', 'CostperkWh', 'PeriodStart', 'PeriodEnd'],
      'filters': []
    };

    IlxServer.getcosts(params, function(err, costsettings) {

      //get all Territory IDs already returned previously
      var territoryids = Object.keys(get_settings);

      //Loop through all the Territories by their IDs
      _.each(territoryids, function(indivTerritoryID) {

        var indivTerr = get_settings[indivTerritoryID];
        indivTerr.hourly_rates = [];

        //Loop through all the Cost Settings for this Territory by their IDs
        _.each(indivTerr.costsettingsids, function(indivCostSettingsID) {

          var indivCostSetting = _.where(costsettings, {"id": indivCostSettingsID})[0];

          var startdatetime = new Date(indivCostSetting.PeriodStart);
          var starthour = startdatetime.getHours(); //0-based, so works well as index

          var enddatetime = new Date(indivCostSetting.PeriodEnd);
          var endhour = enddatetime.getHours();

          //Loop through hrs between start/end times and insert Cost per kWh in array
          for (var i = starthour; i < endhour; i++) {
            indivTerr.hourly_rates[i] = indivCostSetting.CostperkWh;
          }
        });

        //Loop through Hourly Rates array and fill in any blanks
        var min_hourly_rate = _.min(indivTerr.hourly_rates);

        for (var i = 0; i < 24; i++) {
          //Set any blank spaces to the minimum value
          if (!(indivTerr.hourly_rates[i])) { //if null
            indivTerr.hourly_rates[i] = min_hourly_rate;
          }
        }

        get_settings[indivTerritoryID] = indivTerr;
      });


      //EXAMPLE VALUES
      /*get_settings = {
        'Ontario': {
          'hourly_rates': [0.2, 0.2, 0.3, 0.1, 0.2, 0.2, 0.3, 0.1, 0.2, 0.2, 0.3, 0.1, 0.2, 0.2, 0.3, 0.1, 0.2, 0.2, 0.3, 0.1, 0.2, 0.2, 0.3, 0.1,], //prices for 0hrs to 23hrs
          'hourly_limit': 60, //ALREADY POPULATED
          'time_interval': 60, //IGNORE
          'costsettingsids': [], //POPULATED ALREADY
          'sensorids': ['12345', '23456', '34567', '45678'], //POPULATED ALREADY
        }
      }*/

      callback();
    });
  }
};

module.exports = self.getSettings;
