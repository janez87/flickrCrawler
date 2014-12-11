var firstMarker;
var secondMarker;


function addInfoWindow(map, marker, message) {
  var info = message;

  var infoWindow = new google.maps.InfoWindow({
    content: message
  });

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.open(map, marker);
  });
}

function drawBox(v1, v2, map) {
  var bounds = new google.maps.LatLngBounds(
    v1.position,
    v2.position
  );

  // Define a rectangle and set its editable property to true.
  var rectangle = new google.maps.Rectangle({
    bounds: bounds,
    editable: true
  });

  rectangle.setMap(map);

  google.maps.event.addListener(rectangle, 'click', function(evt) {


    $.ajax({
        url: "locationDetails",
        data: {
          sw: [rectangle.bounds.getSouthWest().lat(), rectangle.bounds.getSouthWest().lng()],
          ne: [rectangle.bounds.getNorthEast().lat(), rectangle.bounds.getNorthEast().lng()]
        }
      })
      .done(function(result) {

        var modal = $(result);
        modal.modal('show');

        console.log(modal);
        rectangle.setMap(null)
        rectangle = null;

      })
      .fail(function() {
        console.log('nope');
      })
  });
}

function addMarker(location, map) {

  var removeMarker = function(marker) {
    marker.setMap(null);
    marker = null;
  };

  if (!firstMarker) {
    console.log('first marker');
    firstMarker = new google.maps.Marker({
      position: location,
      map: map
    });
    google.maps.event.addListener(firstMarker, 'click', function() {
      firstMarker.setMap(null);
      firstMarker = null;
    });
  } else if (!secondMarker) {
    console.log('second marker');
    secondMarker = new google.maps.Marker({
      position: location,
      map: map
    });
    google.maps.event.addListener(secondMarker, 'click', function() {
      secondMarker.setMap(null);
      secondMarker = null;
    });
  } else {
    console.log('other marker');
    secondMarker.setMap(null);
    secondMarker = new google.maps.Marker({
      position: location,
      map: map
    });
    google.maps.event.addListener(secondMarker, 'click', function() {
      secondMarker.setMap(null);
      secondMarker = null;
    });
  }

  if (firstMarker && secondMarker) {
    drawBox(firstMarker, secondMarker, map);
    firstMarker.setMap(null);
    secondMarker.setMap(null);
    firstMarker = null;
    secondMarker = null;
  }

}

window.onload = function() {

  console.log('Getting the images');

  $.ajax('imagesLocation')
    .done(function(result) {

      console.log(result.length);
      var $map = $('#map');

      var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(45.4627338, 9.1777323)
      };

      var googleMap = new google.maps.Map($map[0], mapOptions);

      google.maps.event.addListener(googleMap, 'click', function(event) {
        addMarker(event.latLng, googleMap);
      });

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