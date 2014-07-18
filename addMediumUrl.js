var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');

Promise.promisifyAll(mongoose);

var conf = require('./configuration/conf.json');
console.log('Connecting to mongo');
mongoose.connect(conf.db);
var db = mongoose.connection;

var ImageSchema = new mongoose.Schema({
  id: String,
  owner: String,
  secret: String,
  server: String,
  farm: Number,
  title: String,
  ispublic: Number,
  isfriend: Number,
  isfamily: Number,
  license: String,
  description: {
    type: 'mixed'
  },
  dateupload: String,
  lastupdate: String,
  datetaken: Date,
  datetakengranularity: String,
  ownername: String,
  iconserver: String,
  iconfarm: Number,
  views: String,
  tags: String,
  machine_tags: String,
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  context: Number,
  media: String,
  media_status: String,
  url_o: String,
  url_z: String
});

console.log('Loading the schema');
var Image = mongoose.model('image', ImageSchema);


var addField = function(result) {

  var tasks = [];
  for (var i = 0; i < result.length; i++) {
    var image = result[i];
    var farm = image.farm;
    var id = image.id;
    var server = image.server;
    var secret = image.secret;
    var size = 'm';

    var url = 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '_' + size + '.jpg';

    image.url_z = url;
    tasks.push(image.saveAsync());
  }

  console.log(tasks.length);
  return Promise.all(tasks);
};

Image
  .findAsync()
  .then(addField)
  .then(function() {
    console.log('Field added');
  })
  .catch(function(err) {
    console.log(err);
  });