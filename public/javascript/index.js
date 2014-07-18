var $images = $("img");

$images.on('click', function(e) {
  var id = e.currentTarget.id;

  var $popup = $('#details_' + id);

  console.log($popup);
  $popup.modal('show');
});