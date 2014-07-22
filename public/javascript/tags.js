window.onload = function() {


  $.ajax('http://localhost:3000/tags')
    .done(function(result) {

      var $graph = $('#graph');
      for (var i in result) {
        if (result.hasOwnProperty(i)) {
          var tag = i;

          var $tag = $('<span>').html(tag).attr('data-weight', result[tag]);
          $tag.appendTo($graph);
        }
      }

      var settings = {
        "size": {
          "grid": 32,
          "normalize": true
        },
        "options": {
          "color": "random-dark",
          "printMultiplier": 3
        },
        "font": "Futura, Helvetica, sans-serif",
        "shape": "square"
      };

      $graph.awesomeCloud(settings);

    })
    .fail(function(jqXHR, textStatus) {
      console.log(textStatus);
    });



};