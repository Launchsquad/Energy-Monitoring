var _ = require('underscore');
var http = require('http');
var parsexmlString = require('xml2js').parseString;

var teddal = require('../dal/teddal');

var self = {
  /*GetLive: function(get_settings, territory_id, callback) {

    fs.readFile('./conf/conf.json', 'ascii', function(err, returned_conf) {
      conf = JSON.parse(returned_conf);

      //for simplicity, just use the first one for now
      var ted_live = conf.connections.ted[0];
      teddal.getlive(ted_live, function(err, live_data) {

        var output = {
          'Year': result.GatewayTime[0].Year[0],// currentDateTime.getFullYear() - 2000, //results in a 2 digit year
          'Month': result.GatewayTime[0].Month[0],//currentDateTime.getMonth() + 1,
          'Day': result.GatewayTime[0].Day[0],//currentDateTime.getDate(),
          'Hour': result.GatewayTime[0].Hour[0],//currentDateTime.getHours(),
          'Minute': result.GatewayTime[0].Minute[0],//currentDateTime.getMinutes(),

          'Mtus': [],
        };

        //do this to get all the MTUs being used
        _.each(Object.keys(result.Voltage[0]), function(indivMtu) {

          if (indivMtu != "Total") {
            // Get mapped sensor _id from the 'name' id ('_id' is a UUID, 'id' is a string)
            var sensorid = get_settings[territory_id].sensorids[indivMtu];

            output.Mtus.push({
              "Mtu": sensorid,
              "Power": result.Power[0][indivMtu][0].PowerNow[0],
              "Cost": utils.getHourlyCost(
                  get_settings,
                  territory_id,
                  result.GatewayTime.Hour,
                  result.Power[0][indivMtu]
                )
            });
          }
        });

        //console.log("output", JSON.stringify(output));
        callback(output);
      });
    });
  },*/

  GetSecondHistory: function(get_settings, territory_id, query_minute, callback) {

    fs.readFile('./conf/conf.json', 'ascii', function(err, returned_conf) {
      conf = JSON.parse(returned_conf);

      //for simplicity, just use the first one for now
      var ted_sec = conf.connections.ted[0];
      teddal.getsecond(ted_sec, function(second_data) {

        var secondcol = [];
        var full_date;

        _.each(second_data.SECOND, function(indivSec) {
          var new_date = new Date(indivSec.DATE);

          if (new_date.getMinutes() == query_minute) {
            full_date = new_date;
            secondcol.push(indivSec);
          }
        });

        var total_power = _.reduce(_.pluck(secondcol, "POWER"), function(a, b) { return parseInt(a) + parseInt(b); }) / 60;

        var sensorid = get_settings[territory_id].sensorids[ted_sec.mtuids[0]];

        var output = {
          'Year': full_date.getFullYear() - 2000,//results in a 2 digit year
          'Month': full_date.getMonth() + 1,
          'Day': full_date.getDate(),
          'Hour': full_date.getHours(),
          'Minute': query_minute,

          'Mtus': [{
            "Mtu": sensorid,
            "Power": total_power,
            "Cost": utils.getHourlyCost(
                get_settings,
                territory_id,
                full_date.getHours(),
                total_power
              )
          }]
        };

        //console.log("output", JSON.stringify(output));
        callback(output);
      });
    });
  }
};

var utils = {
  //Calculate hourly cost based on territoryID, hour of day, and amt of pwr used
  getHourlyCost: function(get_settings, territory_id, hour, power) {

    var hourly_cost = get_settings[territory_id].hourly_rates[hour] * power;

    //round it to two decimal places, get rid of any floating point errors
    return Math.round(hourly_cost * 100) / 100 || 0; //if null, return 0
  }
};

module.exports = self;
