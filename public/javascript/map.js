function addInfoWindow(map, marker, message) {
  var info = message;

  var infoWindow = new google.maps.InfoWindow({
    content: message
  });

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.open(map, marker);
  });
}


window.onload = function() {

  console.log('Getting the images');

  $.ajax('http://localhost:3000/imagesLocation')
    .done(function(result) {

      console.log(result.length);
      var $map = $('#map');

      var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(45.4627338, 9.1777323)
      };

      var googleMap = new google.maps.Map($map[0], mapOptions);

      var data = [];
      var markers = [];
      console.log(result.length);
      for (var i = 0; i < result.length; i++) {
        var location = result[i];

        if (!location.loc) {
          continue;
        }
        var latitude = location.loc.coordinates[1];
        var longitude = location.loc.coordinates[0];
        /*var marker = new google.maps.Circle({
          center: new google.maps.LatLng(latitude, longitude),
          map: googleMap,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          radius: 15,
          position: new google.maps.LatLng(latitude, longitude)
        });*/

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(latitude, longitude),
        });

        var url = location.url_o || location.url_z;
        var message = '<a target="_blank" href="' + url + '"><img src="' + location.url_sq + '"/></a>';
        addInfoWindow(googleMap, marker, message);
        markers.push(marker);
      }

      var markerCluster = new MarkerClusterer(googleMap, markers);

    })
    .fail(function(jqXHR, textStatus) {
      console.log(textStatus);
    });



};