var Flickr = require('flickrapi');
var _ = require('underscore');
var fs = require('fs');
var Promise = require('bluebird');
var mongoose = require('mongoose');



Promise.promisifyAll(Flickr);
Promise.promisifyAll(mongoose);

//Configuration
var conf = require('./configuration/conf.json');
var yesterday = 1405555200;
var now = new Date().getTime() / 1000;
console.log(now);
var options = {
  extras: ['description', 'license', 'date_upload', 'date_taken', 'owner_name', 'icon_server', 'original_format', 'last_update', 'geo', 'tags', 'machine_tags', 'o_dims', 'views', 'media', 'url_o', 'url_sq', 'url_t', 'url_s', 'url_q', 'url_m', 'url_n', 'url_z', 'url_c', 'url_l'],
  lat: conf.lat,
  lon: conf.lon,
  //text: 'milan',
  //place_id: '49Gidk1WU7JxrFY',
  //radius: 10,
  per_page: 250,
  //has_geo: '0',
  max_upload_date: now,
  min_upload_date: yesterday
};

//Mongo stuff
console.log('Connecting to mongo');
mongoose.connect(conf.db);
var db = mongoose.connection;

var ImageSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
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

/////////////

var _flickr;
var pages;
var currentPage = 0;
var firstDownload = function(flickr) {
  _flickr = flickr;
  Promise.promisifyAll(_flickr.photos);
  console.log('Downloading the first page of photo and donwload data (# of pages)');
  return new Promise(function(resolve, reject) {
      flickr.photos.search(options, function(err, results) {
        if (err) return reject(err);

        pages = results.photos.pages;
        console.log('Retrieved ' + results.photos.total + ' photos in total');
        console.log('Found ' + pages + ' pages');
        console.log('Per page: ' + results.photos.photo.length);
        return resolve(results);
      });
    })
    //.then(savePhoto);

};

var createPromise = function() {
  var tasks = [];
  for (var i = 1; i <= pages; i++) {
    options.page = i;
    tasks.push(_flickr.photos.searchAsync(options)
      .then(savePhoto));
  }
  return Promise.all(tasks);
};

var savePhoto = function(result) {
  var photos = result.photos.photo;
  console.log('Saving ' + photos.length + ' photos of page ' + result.photos.page + ' over ' + result.photos.pages + ' pages');
  return mongoose.model('image').collection.insertAsync(photos, {
    keepGoing: true
  });
};



Flickr.tokenOnlyAsync(conf)
  .then(firstDownload)
  .then(createPromise)
  .then(function() {
    console.log('Photo saved');
  })
  .catch(function(err) {
    console.log(err);
  });