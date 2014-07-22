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


  $.ajax('http://localhost:3000/imagesLocation')
    .done(function(result) {

      var $map = $('#map');

      var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(45.4627338, 9.1777323)
      };

      var googleMap = new google.maps.Map($map[0], mapOptions);

      var data = [];
      for (var i = 0; i < result.length; i++) {
        var location = result[i];

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.latitude, location.longitude),
          map: googleMap,
        });

        var url = location.url_o || location.url_z;
        var message = '<a target="_blank" href="' + url + '"><img src="' + location.url_sq + '"/></a>';
        addInfoWindow(googleMap, marker, message);
      }

    })
    .fail(function(jqXHR, textStatus) {
      console.log(textStatus);
    });



};