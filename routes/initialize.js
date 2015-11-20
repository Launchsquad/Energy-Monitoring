var fs = require('fs');

function initialize(callback) {

  fs.readFile('./conf/conf.json', 'ascii', function(err, conf) {
    //var conf = JSON.parse(returned_conf);

    //if conf file doesn't exist
      // initialize it!
    //else
      //proceed on as normal

    if (conf) {
      //config exists, proceed as normal
      callback();
    } else {

      //Set Default Values
      conf = {
        active:false,
        territory:"",
        connections:{
          ted:[{
            hostname:"",
            livedata:{
              path:"/api/LiveData.xml"
            },
            secondhistory:{
              "path":"/history/secondhistory.xml",
              "mtuids":[""]
            }
          }],
          intelex: {
            auth:"",
            hostname:"soapxcloud.intelex.com",
            basicselect:"/WcfJsonRest/WcfJsonRestTest.BasicSelectService1.svc",
            datamanager:"/WcfJsonRest/WcfJsonRestTest.DataManagerService1.svc",
            schema:"/WcfJsonRest/WcfJsonRestTest.SchemaService1.svc"
          }
        }
      };

      //Write default values to Conf file
      fs.writeFile('./conf/conf.json', JSON.stringify(conf), function(err, conf_return) {
        if (err) {
          res.status("500").send({ autherror: err });
        } else {
          callback();
        }
      });
    }
  });
}

module.exports = initialize;
