$(function() {

    // next add the onclick handler
    /*$("#help").click(function() {
        vex.dialog.prompt('<h1>Help</h1><p>Download the <a href="http://www.ti.com/ww/en/wireless_connectivity/sensortag2015/?INTC=SensorTag&HQS=sensortag">TI Sensortag</a> app on your mobile</p><a target="_blank" href="https://play.google.com/store/apps/details?id=com.ti.ble.sensortag"><img title="apps download android" alt="apps download android" src="images/android_45.png"></a><a target="_blank" href="https://itunes.apple.com/app/ti-sensortag/id552918064"><img title="apps download apple" alt="apps download apple" src="images/apple.svg" /></a>Use this utility to map your TI Sensortag with the car in <a href="http://connected-car.mybluemix.net/">Connected Car Demo</a><p>Press '+' to insert mapping. </p>');
    });*/
    $("#help").click(function() {
        vex.open({
            content:'<h1>Help!!!</h1><p>Download the <a href="http://www.ti.com/ww/en/wireless_connectivity/sensortag2015/?INTC=SensorTag&HQS=sensortag">TI Sensortag</a> app on your mobile</p><br /><a target="_blank" href="https://play.google.com/store/apps/details?id=com.ti.ble.sensortag"><img title="apps download android" alt="apps download android" src="images/android_45.png"></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a target="_blank" href="https://itunes.apple.com/app/ti-sensortag/id552918064"><img title="apps download apple" alt="apps download apple" src="images/apple.svg" /></a><br /><br /><p>Use this utility to map your TI Sensortag with the car in <a target="_blank" href="http://connected-car.mybluemix.net/">Connected Car Demo</a></p><p>Press + to insert mapping. </p>',
            showCloseButton : true,
            escapeButtonCloses: true
         });
    });


    $("#jsGrid").jsGrid({
        height: "70%",
        width: "100%",
        filtering: true,
        inserting: true,
        editing: true,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 10,
        pageButtonCount: 5,
        noDataContent : "No Mappings present!!",
        deleteConfirm: "Do you really want to delete the Mapping?",
        controller: {
            loadData: function(filter) {
                return $.ajax({
                    type: "GET",
                    url: "/clients",
                    data: filter
                });
            },
            insertItem: function(item) {
                return $.ajax({
                    type: "POST",
                    url: "/clients",
                    data: item
                });
            },
            updateItem: function(item) {
                return $.ajax({
                    type: "PUT",
                    url: "/clients",
                    data: item
                });
            },
            deleteItem: function(item) {
                return $.ajax({
                    type: "DELETE",
                    url: "/clients",
                    data: item
                });
            }
        },
        fields: [
            { title : "Mapping Name", name: "Name", type: "text", width: 150 },
            { title : "Car ID", name: "CarId", type: "number", width: 50, filtering : false, sorter: "number", },
            { title : "Mac Address of Sensor Tag", name: "Mac", type: "text", width: 200, editing : false },
            { type: "control" }
        ]
    });

    
    
});


