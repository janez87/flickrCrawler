var express = require('express');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var clusterfck = require('clusterfck');
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

app.get('/cluster', function(req, res) {

  Image
    .find({
      loc: {
        $geoWithin: {
          $centerSphere: [
            [9.163999, 45.458159], 10 / 6371
          ]
        }
      }
    }, {
      loc: 1
    })
    .exec(function(err, result) {

      if (err) return res.send(err);

      var coordinates = _.map(result, function(p) {
        return p.loc.coordinates;
      });

      var clusters = clusterfck.kmeans(coordinates, 150);

      clusters = _.map(clusters, function(c) {

        var count = c.length;

        var lat = 0;
        var lon = 0;

        for (var i = 0; i < c.length; i++) {
          lat += c[i][1];
          lon += c[i][0];
        }

        lat = lat / c.length;
        lon = lon / c.length;

        return {
          size: count,
          centroid: {
            lat: lat,
            lon: lon
          },
          points: c
        };
      });
      return res.json(clusters);
    });
});

app.get('/imagesLocation', function(req, res) {

  var query = {
    loc: {
      $geoWithin: {
        $centerSphere: [
          [9.163999, 45.458159], 20 / 6371
        ]
      }
    }
  };

  var projection = {
    url_sq: 1,
    url_o: 1,
    url_z: 1,
    loc: 1
  };

  Image
    .find({}, projection)
    .exec(function(err, result) {
      if (err) return res.send(err);

      console.log(result.length);
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

  var normalize = function(min, max, lmin, lmax, x) {
    //return Number(((x - min) / (max - min)).toFixed(4));
    return (Math.log(x) / Math.log(2)).toFixed(2);
    //var scale = (lmax - lmin) / (max - min);
    //return ((Math.log(x) - lmin) / scale + min);

  };

  var query = {
    loc: {
      $geoWithin: {
        $centerSphere: [
          [conf.lon, conf.lat], 20 / 6371
        ]
      }
    }
  };


  Image
    .find(query)
    .select('tags')
    .select('title')
    .exec(function(err, result) {
      if (err) return res.send(err);

      //if (!result) result = [];
      var count = {};

      for (var i = 0; i < result.length; i++) {
        var tags = result[i].tags;



        if (_.isUndefined(tags) || tags === '') {
          tags = [];
        } else {
          tags = tags.split(' ');
        }


        //Tags from the title
        var otherTags = result[i].title.split(' ');

        for (var j = 0; j < otherTags.length; j++) {
          var t = otherTags[j];

          if (t.indexOf('#') === 0) {
            tags.push(t);
          }
        }


        if (tags.length === 0) {
          continue;
        }

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

      var sum = 0;
      var tot = 0;
      for (var key in count) {
        if (count[key] < 100) {
          delete count[key];
        } else {
          sum += count[key];
          tot++;
        }
      }

      var avg = sum / tot;
      var min = _.min(count);
      var max = _.max(count);

      var lmin = _.min(count);
      var lmax = _.max(count);

      console.log(min);
      console.log(max);
      console.log(avg);
      for (var k in count) {
        count[k] = normalize(min, max, lmin, lmax, count[k]);
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
        latitude: '$loc.cooordinates[1]',
        longitude: '$loc.coordinates[0]'
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

app.get('/viewClusters', function(req, res) {
  res.render('cluster.jade');
});

app.listen(3000, function() {

  console.log('Connecting to mongo');
  mongoose.connect(conf.db);
  server.db = mongoose.connection;

  console.log('Server up on port 3000');


});