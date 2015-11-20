var _ = require('underscore');
var fs = require('fs');

var teddal = require('../dal/teddal');

var self = {
  getTedData: function(req, res) {

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);

      //get the ted device that was specified via API,
      var ted_device = _.where(conf.connections.ted, {"hostname": req.query.hostname})[0];

      teddal.getlive(ted_device, function(err, live_data) {
        if (err) {
          res.status("500").send(err);
        } else {
          live_data = live_data || {}; //make sure by default it doesn't send back NULL/undefined
          res.send(live_data);
        }
      });
    });
  },

  getAllTed: function(req, res) {

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);
      var conf_ted = conf.connections.ted || {}; //make sure by default it doesn't send back NULL/undefined
      res.send(conf_ted);
    });


    /*ilxserver.getsensors(params, function(sensorsettings) {
      res.send(sensorsettings);
    });*/

    //teddal.

    /*_.each(conf.connections.ted, function(indivTed) {

      var get_options = {
        protocol: 'http:',
        hostname: indivTed.hostname,
        path: indivTed.livedata.path,
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

            res.send(result.LiveData);
          });
        });
      });

      // post the params
      post_req.write(JSON.stringify({}));
      post_req.end();
    });*/
  },

  setTed: function(req, res) {
    //write hostname
    //write the ONE sensor (ONE for now)

    fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
      conf = JSON.parse(conf);

      conf.connections.ted[0].hostname = req.body.hostname;
      conf.connections.ted[0].secondhistory.mtuids[0] = req.body.mtuid;

      //Write default values to Conf file
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
