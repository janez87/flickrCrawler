var heatmap;
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


        if (!location.loc) {
          continue;
        }
        var latitude = location.loc.coordinates[1];
        var longitude = location.loc.coordinates[0];
        data.push(
          new google.maps.LatLng(latitude, longitude)
        );
      }

      heatmap = new google.maps.visualization.HeatmapLayer({
        data: data,
        maxIntensity: 100
      });

      heatmap.setMap(googleMap);

    })
    .fail(function(jqXHR, textStatus) {
      console.log(textStatus);
    });



};