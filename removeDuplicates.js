var _ = require('underscore');
var Promise = require('bluebird');
var mongoose = require('mongoose');

Promise.promisifyAll(mongoose);

//Configuration
var conf = require('./configuration/conf.json');

//Mongo stuff
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

var findDuplicates = function() {
  return Image.collection.aggregateAsync([{
    $group: {
      _id: {
        name: "$id"
      }, // replace `name` here twice
      uniqueIds: {
        $addToSet: "$_id"
      },
      count: {
        $sum: 1
      }
    }
  }, {
    $match: {
      count: {
        $gte: 2
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }, {
    $limit: 50
  }]);
};


var removeDuplicates = function(result) {
  console.log('Removing duplicates');
  var tasks = [];
  for (var i = 0; i < result.length; i++) {
    var duplicate = result[i];
    duplicate.uniqueIds.pop();

    tasks.push(Image.find()
      .where('_id')
      .in(duplicate.uniqueIds)
      .remove()
      .execAsync());
  }

  return Promise.all(tasks);
};

findDuplicates()
  .then(removeDuplicates)
  .then(function() {
    console.log('Duplicates removed');
  })
  .catch(function(err) {
    console.log(err);
  });