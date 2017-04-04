var express = require('express');
var router = express.Router();
var mqtt = require('mqtt');

var Datastore = require('nedb');
var db = new Datastore({'filename' : './db/clients'});
db.loadDatabase();
var getClientFilter = function(query) {
    var result = {
        Name: new RegExp(query.Name, "i"),
        Mac: new RegExp(query.Mac, "i")
    };

    return result;
};

router.get('/', function(req, res, next) {
    db.find(getClientFilter(req.query), function(err, items) {
        res.json(items);
    });
});

router.post('/', function(req, res, next) {
    if(!req.body.CarId || !req.body.Mac) {
        res.status(400).send('Bad Request : Null Values Passed');
    } else {
        db.insert(req.body, function(err, item) {
            addMapping(item.Mac);
            res.json(item);
        });
    }
});

router.put('/', function(req, res, next) {
    if(!req.body.CarId || !req.body.Mac) {
        res.status(400).send('Bad Request : Null Values Passed');
    } else {
        var item = req.body;
        db.update({ _id: item._id }, item, {}, function(err) {
            res.json(item);
        });
    }
});

router.delete('/', function(req, res, next) {
    var item = req.body;

    db.remove({ _id: item._id }, {}, function(err) {
        removeMapping(item.Mac);
        res.json(item);
    });
});

// have 2 connections for iotf and connected car messagesight
var iotfHost = "tcp://quickstart.messaging.internetofthings.ibmcloud.com:1883";
var demoHost = "tcp://messagesight.demos.ibm.com:1883";
var DEVICE_EVT_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/evt\/(.+)\/fmt\/(.+)$/;

var iotfOptions = {
    clientId : "a:quickstart:"+ Math.random().toString(16).substr(2, 8)
};

var demoOptions = {
    clientId : Math.random().toString(16).substr(2, 8)
};

var demoMqtt = mqtt.connect(demoHost, demoOptions);
var iotfMqtt = mqtt.connect(iotfHost, iotfOptions);

var lastCarFired = 0;

iotfMqtt.on('connect', function function_name (argument) {
    console.log("Successfully connected to IoTF with : "+iotfOptions.clientId);
});

iotfMqtt.on('message',function function_name (topic, message, packet) {

    console.log("Topic : %s and message : %s",topic,message);

    var jsonMesg;
    try {
        jsonMesg = JSON.parse(message);
    } catch (err) {
        //parsing error, ignore
        return;
    }
    var match = DEVICE_EVT_RE.exec(topic);
    var deviceId = match[2];
    // any condition on the sensortag
    //currently its a press of a button
    if((jsonMesg.d.optical && jsonMesg.d.optical < 5) || (jsonMesg.d.light && jsonMesg.d.light < 5)) {
        console.log("condition satisfied!!")
        db.find({ Mac: deviceId }, function (err, docs) {

            if(lastCarFired == 0) {
                var carId = docs[0].CarId;
                console.log("Action for carId :: "+carId)
                demoMqtt.publish("demo/car/event/"+carId+"/airbag","0");
                var payload = JSON.stringify({
                        type: "AIRBAG",
                        id: carId
                    });
                demoMqtt.publish("demo/event",payload);
                lastCarFired = carId;
                setTimeout(function(){ lastCarFired = 0; }, 30000);
            } else {
                console.log("Same car event was fired recently!!");
            }

        });
    }

});

demoMqtt.on('connect', function function_name (argument) {
    console.log("Successfully connected to demo messagesight with : "+demoOptions.clientId);
})

function addMapping (mac) {
    var topic = "iot-2/type/+/id/"+mac+"/evt/+/fmt/json";
    console.log("subscribing to : "+topic);
    iotfMqtt.subscribe(topic);
}

function removeMapping (mac) {
    var topic = "iot-2/type/+/id/"+mac+"/evt/+/fmt/json";
    console.log("Unsubscribing to : "+topic);
    iotfMqtt.unsubscribe(topic);
}


module.exports = router;
