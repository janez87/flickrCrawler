window.onload = function() {


  $.ajax('http://localhost:3000/locations')
    .done(function(result) {

      var $map = $('#map');

      var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(45.4627338, 9.1777323)
      };

      var googleMap = new google.maps.Map($map[0], mapOptions);
      /*var infoWindow = new google.maps.InfoWindow();
      for (var i = 0; i < result.length; i++) {
        var marker;
        var location = result[i];

        var lat = location._id.latitude;
        var lon = location._id.longitude;
        var count = location.count;


        marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lon),
          map: googleMap
        });

        google.maps.event.addListener(marker, 'click', (function(marker, content, infoWindow) {
          return function() {
            infoWindow.setContent('' + content);
            infoWindow.open(googleMap, marker);
          };
        })(marker, count, infoWindow));

      }*/

      var data = [];
      for (var i = 0; i < result.length; i++) {
        var location = result[i];

        data.push({
          weight: location.count,
          location: new google.maps.LatLng(location._id.latitude, location._id.longitude)
        });
      }

      console.log(data[0]);
      var heatmap = new google.maps.visualization.HeatmapLayer({
        data: data,
        maxIntensity: 30
      });

      heatmap.setMap(googleMap);

    })
    .fail(function(jqXHR, textStatus) {
      console.log(textStatus);
    });



};