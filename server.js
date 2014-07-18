var express = require('express');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('underscore');

Promise.promisifyAll(mongoose);
Promise.promisifyAll(express);

var app = express();
var conf = require('./configuration/conf.json');

var server = {};

app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

app.get('/images', function(req, res) {

  var Image = server.Image;

  var perPage = 100;

  var page = parseInt(req.param('page')) || 0;
  Image
    .find()
    .limit(perPage)
    .skip(perPage * page)
    .sort({
      id: 'asc'
    })
    .exec(function(err, result) {
      if (err) res.send(err);

      if (!_.isArray(result)) result = [result];

      res.render('index.jade', {
        images: result,
        page: page
      });
    });
});

app.get('/images/:id', function(req, res) {

  var id = req.params.id;
  server.Image
    .findById(id, function(err, image) {
      if (err) res.send(err);

      res.json(image);
    });
});

app.get('/tags', function(req, res) {

  server.Image
    .find()
    .select('tags')
    .exec(function(err, result) {
      if (err) res.send(err);

      var count = {};

      for (var i = 0; i < result.length; i++) {
        var tags = result[i].tags;

        if (tags === '') continue;

        tags = tags.split(' ');

        for (var j = 0; j < tags.length; j++) {
          var tag = tags[j];

          // It's an automatic tag
          if (tag.indexOf(':') !== -1) continue;

          if (!count[tag]) {
            count[tag] = 1;
          } else {
            count[tag]++;
          }
        }
      }

      for (var key in count) {
        if (count[key] < 100) {
          delete count[key];
        }
      }
      res.json(count);
    });
});


app.get('/locations', function(req, res) {

  /*server.Image
    .find()
    .where('latitude').ne("0")
    .where('longitude').ne("0")
    .select('latitude')
    .select('longitude')
    .limit(100)
    .exec(function(err, result) {
      if (err) res.send(err);

      console.log(result.length);

      res.json(result);
    });*/

  var query = [{
    $match: {
      latitude: {
        $ne: 0
      },
      longitude: {
        $ne: 0
      }
    }
  }, {
    $group: {
      _id: {
        latitude: '$latitude',
        longitude: '$longitude'
      },
      count: {
        $sum: 1
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }];
  server.Image.collection
    .aggregate(query, function(err, result) {
      if (err) res.send(err);

      res.json(result);
    });

});


app.get('/viewTags', function(req, res) {
  res.render('tags.jade');
});

app.get('/map', function(req, res) {
  res.render('map.jade');
})

app.listen(3000, function() {

  console.log('Connecting to mongo');
  mongoose.connect(conf.db);
  server.db = mongoose.connection;

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
  server.Image = mongoose.model('image', ImageSchema);

  console.log('Server up on port 3000');


});