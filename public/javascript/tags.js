window.onload = function() {


  $.ajax('tags')
    .done(function(result) {

      console.log(result);
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
          "grid": 64,
          "normalize": true
        },
        "options": {
          "color": "random-dark",
          "printMultiplier": 1
        },
        "font": "Futura, Helvetica, sans-serif",
        "shape": "square"
      };

      $graph.awesomeCloud(settings);

      console.log('finished');
    })
    .fail(function(jqXHR, textStatus) {
      console.log(textStatus);
    });


};