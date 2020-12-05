
var map = L.map('map');  
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {maxZoom: 20,}).addTo(map);  

map.locate({setView: true, maxZoom: 18,  watch:true});

var startmarker;
var radius;
var endmarker;
function onLocationFound(e) {
   
        radius = e.accuracy / 2;
        startmarker = L.marker(e.latlng).addTo(map).bindPopup("You are within " + radius + " meters from this point").openPopup();
        const startlat = e.latlng.lat;
        const startlng = e.latlng.lng;
      
        map.on('click', function(ev) {
            var endlat = ev.latlng.lat;
            var endlong = ev.latlng.lng;
           
            endmarker = L.marker([endlat, endlong]).addTo(map)
            .bindPopup(L.popup({
                autoClose: false,
                closeOnClick: false,
            }))
            .setPopupContent('You are going to' + ev.latlng.toString())
            .openPopup();

            L.Routing.control({
                waypoints: [
                    L.latLng(e.latlng.lat, e.latlng.lng), 
                    L.latLng(endlat, endlong)
                ]
                
            }).addTo(map);

    
         //POST method to the server to send all the 4 coordinates in JSON format   
        info = JSON.stringify({'current1': startlat, 'current2': startlng, 'end1': endlat, 'end2':endlong});
        $.post( "http://localhost:8080/", info);
        console.log("DATA passed");


//FOR MQTT----------------
        client.connect({
            onSuccess: function () {
                console.log("mqtt client on");
                message = new Paho.MQTT.Message(info);  //pass info which is stringified above
                message.destinationName = "coe-457/HW3";
                client.send(message);
                client.disconnect();
            },
            onFailure: function (message) {
                console.log("Connection failed: " + message.errorMessage);
            }
        });
 })
}


map.on('locationfound', onLocationFound); //turn on map and detect location by default
