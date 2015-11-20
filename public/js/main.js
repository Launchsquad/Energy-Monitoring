$ = jQuery;

$(document).ready(function() {
    console.log( "ready!" );

    getStatus();

    //Make sure user is still authenticated

    //Check to see if any TED devices are connected

    //Check to see if territories have been configured
      //Check if current app is configured to one of those territories

    //Check to see if sensors have been configured and are 'attached' to TED Devices
      //If not,
});


function authenticate() {
  //Base64 encode 'username:password'
  var encoded_userpass = btoa($("#username").val() + ":" + $("#password").val());
  //console.log("encoded", btoa($("#username").val() + ":" + $("#password").val()));


  $("#autherrorlist").empty();

  $.when(

    $.ajax({
      type: "GET",
      url: "/api/user/auth",
      data: {userpass: encoded_userpass},
      dataType: "json"
    })

  ).then(function(user_auth) {
    //console.log("user_auth", user_auth);
    $("#autherrorlist").append("<div class='auth'>User '" + $("#username").val() + "' is properly authenticated</div>");


    return $.ajax({
      type: "GET",
      url: "/api/user/installed",
      data: {},
      dataType: "json"
    });

  }).then(function(user_installed) {
    //console.log("user_installed", user_installed);

    refreshsensors();
    refreshted();
    refreshterritory();

  }).fail(function(err) {
    var error = "";

    try {
      error = JSON.parse(err.responseText);
    }
    catch(err2) {
      //ignore error, returned err from AJAX just wasn't an object
      error = err;
    }
    finally {
      if (error.autherror) {
        $("#autherrorlist").append("<div class='auth'>Error occurred: Authentication Failed. Please make sure you have a valid username & password.</div>");
      } else if (error.installerror) {
        $("#autherrorlist").append("<div class='auth'>Error occurred: Application not found; please make sure you have the Energy Monitoring App installed on your Intelex Platform.</div>");
      } else {
        $("#autherrorlist").append("<div class='auth'>Error occurred: " + error + "</div>");
      }
    }
  });
}

function refreshsensors() {

  $("#sensorlist").empty();
  $("#sensorlist").html("<img class='loadinggif' src='../images/loading.gif'>");

  $.when(

    $.ajax({
      type: "GET",
      url: "/api/sensor/all",
      data: { "test": "asdf" },
      dataType: "json",
    }),

    $.ajax({
      type: "GET",
      url: "/api/territory/all",
      data: {},
      dataType: "json",
    })

  ).then(function(sensor_data, territory_data) {
    //console.log("sensor_data[0]", sensor_data[0]);
    //console.log("territory_data[0]", territory_data[0]);

    var settingids = _.pluck(territory_data[0], "SettingID");

    $("#sensorlist").empty();

    _.each(_.uniq(settingids), function(indivSettingID) {
      $("#sensorlist").append("<div class='territory'>Territory: <b>" + indivSettingID + "</b></div>");
      //console.log("indivSettingID", indivSettingID);

      var territories = _.where(territory_data[0], {"SettingID": indivSettingID});
      var sensorids = _.pluck(territories, "AssociatSensors.id");
      //var sensors = _.where(settingids, {"SettingID": indivSettingID});

      _.each(_.uniq(sensorids), function(indivSensorID) {
        var sensorname = _.where(sensor_data[0], {"id": indivSensorID})[0].SensorID;
        $("#sensorlist").append("<div class='sensor'>Sensor: <b>" + sensorname + "</b></div>");
      });
    });

    if (!(territory_data[0])) {
      $("#sensorlist").append("<div class='sensor'>No Territories configured in Intelex Platform</div>");
    }
    if (!(sensor_data[0])) {
      $("#sensorlist").append("<div class='sensor'>No Sensors configured in Intelex Platform</div>");
    }

  }).fail(function(err) {
    console.log("AJAX ERR", err);
    $("#sensorlist").empty();

    //Filter out common errors, and replace them with msgs that make sense...
    if (err.responseText.indexOf("unsecured or incorrectly secured") > 0) {
      $("#sensorerrorlist").append("<div class='sensor'>Error occurred: " + err.responseText + "</div>");
    } else {
      $("#sensorerrorlist").append("<div class='sensor'>Error occurred: There is an issue with your username/password. Please make sure to re-enter above to properly authenticate.</div>");
    }
  });
}


function refreshted() {
  $("#tedlist").empty();
  $("#tederrorlist").empty();
  $("#tedlist").html("<img class='loadinggif' src='../images/loading.gif'>");
  $("#configted").css('display', 'none');

  var tedcol;

  $.when(
    $.ajax({
      type: "GET",
      url: "/api/ted/all",
      data: {},
      dataType: "json",
    })
  ).then(function(tedcol_data) {
    //console.log("tedcol_data", tedcol_data);
    tedcol = tedcol_data;

    return $.ajax({
      type: "GET",
      url: "/api/ted",
      data: { "hostname": tedcol_data[0].hostname },
      dataType: "json",
    });

  }).then(function(ted_data) {
    //console.log("ted_data", ted_data);
    $("#tedlist").empty();

    //console.log("tedcol[0]", tedcol[0]);

    $("#changeted").css('display', 'inline-block');

    //If no hostname, then no TED Device has been configured yet
    if (tedcol[0].hostname) {
      $("#tedlist").append("<div class='device'>Device : <b>" + tedcol[0].hostname + "</b>: ACTIVE</div>");
    } else {
      $("#tedlist").append("<div class='device'>No Device configured</div>");

      //SHOW TED CONFIG FIELDS - hostname & Sensor Name (e.g. MTU1)
    }


    //Get Sensor Names that are actually in TED Device
    var sensor_names = [];
    if (ted_data.Power) {
      sensor_names = Object.keys(ted_data.Power[0]);
    }
    //console.log("sensor_names", sensor_names);


    if (ted_data.GatewayTime) {
      //returned properly

      _.each(tedcol[0].secondhistory.mtuids, function(indivMtuID) {
        $("#tedlist").append("<div style='margin-left: 20px;'>Sensor: <b>"  + indivMtuID + "</b></div>");

        if (!(_.contains(sensor_names, indivMtuID))) {
          $("#tederrorlist").append("<div> Sensor '" + indivMtuID + "' is not attached to TED Device.</div>");
        }
      });
    }

  }).fail(function(err) {
    //console.log("AJAX ERR", err);
    $("#tedlist").empty();

    var error_text = "";
    var err_responseText = JSON.parse(err.responseText);

    if (err_responseText.code == "ENOTFOUND") {
      error_text = "TED Device '" + err_responseText.hostname + "' was not found.";
    } else {
      error_text = err.responseText;
    }

    $("#changeted").css('display', 'inline-block');

    $("#tederrorlist").append("<div class='sensor'>Error occurred: " + error_text + "</div>");
  });
}


function changeted() {
  $("#changeted").css('display', 'none');

  $("#configted").css('display', 'block');
}

function saveted() {

  var error_free = true;
  $("#tedhostname").removeClass('error');
  $("#tedsensorname").removeClass('error');

  var ted_hostname = $("#tedhostname").val().trim();
  var ted_sensorname = $("#tedsensorname").val().trim();

  if (ted_hostname === "") {
    error_free = false;
    $("#tedhostname").addClass('error');
  }
  if (ted_sensorname === "") {
    error_free = false;
    $("#tedsensorname").addClass('error');
  }

  if (error_free) {

    //Save Selected Territory
    $.ajax({
      type: "POST",
      url: "/api/ted",
      data: {
        hostname: ted_hostname,
        mtuid: ted_sensorname
      },
      dataType: "json",
      success: function(data) {

        //refresh the HTML
        refreshted();

        $("#tedhostname").val('');
        $("#tedsensorname").val('');
      },
      fail: function(err) {
        console.log("ERROR", err);
        $("#territoryerrorlist").append("<div>Error occurred: " + err.responseText + "</div>");
      }
    });
  }
}

function cancelted() {
  $("#tedhostname").removeClass('error');
  $("#tedsensorname").removeClass('error');

  $("#tedhostname").val('');
  $("#tedsensorname").val('');
}


function refreshterritory() {
  $("#territorylist").empty();
  $("#territorylist").html("<img class='loadinggif' src='../images/loading.gif'>");

  $.ajax({
    type: "GET",
    url: "/api/territory/current",
    data: {},
    dataType: "json",
    success: function(data) {
      console.log("AJAX SUCCESS", data);

      $("#changeterritory").css('display', 'inline-block');

      if (data.territory) {
        $("#territorylist").html("<div>Current Territory: " + data.territory + "</div>");

        //make 'change' btn visible
        $("#changeterritory").text("Change...");
      } else {
        $("#territorylist").html("<div>No Current Territory configured</div>");

        //Show a dropdown of the Territories configured in ILX
        $("#changeterritory").text("Configure...");
      }
    },
    fail: function(err) {
      //console.log("AJAX ERR", err);
      $("#territoryerrorlist").append("<div>Error occurred: " + err.responseText + "</div>");
    }
  });
}

function changeterritory() {

  $("#changeterritory").css("display", "none");

  $.ajax({
    type: "GET",
    url: "/api/territory/all",
    data: {},
    dataType: "json",
    success: function(territory_data) {
      //console.log("change territory data:", territory_data);

      var territories = _.uniq(_.pluck(territory_data, "SettingID"));
      //console.log("territories", territories);

      //Populate dropdown with
      $("#territorydropdown").empty();
      _.each(territories, function(indivTerritory) {
        $("#territorydropdown").append("<option value='" + indivTerritory + "'>" + indivTerritory + "</option>");
      });

      $("#configterritory").css("display", "block");
    },
    fail: function(err) {
      //console.log("AJAX ERR", err);
      $("#territoryerrorlist").append("<div>Error occurred: " + err.responseText + "</div>");
    }
  });
}

function selectterritory() {
  $("#configterritory").css("display", "none");

  var selected_territory = $('#territorydropdown').find(":selected").text();
  //console.log("SELECTED", $('#territorydropdown').find(":selected").text());

  //Save Selected Territory
  $.ajax({
    type: "POST",
    url: "/api/territory/current",
    data: { territory: selected_territory },
    dataType: "json",
    success: function(data) {

      //refresh the HTML
      refreshterritory();
    },
    fail: function(err) {
      //console.log("ERROR", err);
      $("#territoryerrorlist").append("<div>Error occurred: " + err.responseText + "</div>");
    }
  });
}

function cancelterritory() {
  $("#changeterritory").css("display", "inline-block");
  $("#configterritory").css("display", "none");
}




function start() {
  //Start Service
  $.ajax({
    type: "POST",
    url: "/api/service/start",
    data: {},
    dataType: "json",
    success: function(data) {

      $("#start").css('display', 'none');
      $("#stop").css('display', 'inline-block');

      $("#servicemessage").html("Service Started!");
    },
    fail: function(err) {
      //console.log("ERROR", err);
      $("#territoryerrorlist").append("<div>Error occurred: " + err.responseText + "</div>");
    }
  });
}

function stop() {
  //Stop Service
  $.ajax({
    type: "POST",
    url: "/api/service/stop",
    data: {},
    dataType: "json",
    success: function(data) {

      $("#stop").css('display', 'none');
      $("#start").css('display', 'inline-block');

      $("#servicemessage").html("Service Stopped!");
    },
    fail: function(err) {
      //console.log("ERROR", err);
      $("#territoryerrorlist").append("<div>Error occurred: " + err.responseText + "</div>");
    }
  });
}

function getStatus() {
  //Get Service Status
  $.ajax({
    type: "GET",
    url: "/api/service",
    data: {},
    dataType: "json",
    success: function(data) {

      if (data.active) {
        //is Started
        $("#stop").css('display', 'inline-block');
        $("#start").css('display', 'none');

        $("#servicemessage").html("Service Started!");
      } else {
        //is Stopped
        $("#stop").css('display', 'none');
        $("#start").css('display', 'inline-block');

        $("#servicemessage").html("Service Stopped!");
      }
    },
    fail: function(err) {
      console.log("ERROR", err);
      //$("#territoryerrorlist").append("<div>Error occurred: " + err.responseText + "</div>");
    }
  });
}
