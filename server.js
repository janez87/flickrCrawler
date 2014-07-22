var express = require('express');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('underscore');

var Image = require('./model/image');

Promise.promisifyAll(mongoose);
Promise.promisifyAll(express);

var app = express();
var conf = require('./configuration/conf.json');

var server = {};

app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

app.get('/images', function(req, res) {

  //var Image = server.Image;

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

app.get('/imagesLocation', function(req, res) {

  var query = {
    loc: {
      $geoWithin: {
        $centerSphere: [
          [9.163999, 45.458159], 10 / 6371
        ]
      }
    }
  };

  var projection = {
    url_sq: 1,
    latitude: 1,
    longitude: 1,
    url_o: 1,
    url_z: 1
  };

  Image
    .find(query, projection)
    .exec(function(err, result) {
      if (err) return res.send(err);

      return res.json(result);
    });
});

app.get('/images/:id', function(req, res) {

  var id = req.params.id;
  Image
    .findById(id, function(err, image) {
      if (err) res.send(err);

      res.json(image);
    });
});

app.get('/tags', function(req, res) {

  var query = {
    $or: [{
      latitude: 0,
      longitude: 0
    }, {
      loc: {
        $geoWithin: {
          $centerSphere: [
            [conf.lon, conf.lat], 20 / 6371
          ]
        }
      }
    }]
  };

  Image
    .find(query)
    .select('tags')
    .exec(function(err, result) {
      if (err) return res.send(err);

      //if (!result) result = [];

      var count = {};

      for (var i = 0; i < result.length; i++) {
        var tags = result[i].tags;

        if (tags === '') continue;

        tags = tags.split(' ');

        for (var j = 0; j < tags.length; j++) {
          var tag = tags[j];

          // It's an automatic tag
          if (tag.indexOf(':') !== -1) continue;
          if (tag === 'milan' || tag === 'milano') continue;

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

  var query = [{
    $match: {
      loc: {
        $geoWithin: {
          $centerSphere: [
            [conf.lon, conf.lat], 20 / 6371
          ]
        }
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
  Image.collection
    .aggregate(query, function(err, result) {
      if (err) res.send(err);

      res.json(result);
    });

});


app.get('/viewTags', function(req, res) {
  res.render('tags.jade');
});

app.get('/heatmap', function(req, res) {
  res.render('heatmap.jade');
});

app.get('/map', function(req, res) {
  res.render('map.jade');
});

app.listen(3000, function() {

  console.log('Connecting to mongo');
  mongoose.connect(conf.db);
  server.db = mongoose.connection;

  console.log('Server up on port 3000');


});