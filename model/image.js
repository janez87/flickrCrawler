  var mongoose = require('mongoose');
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
    url_z: String,
    url_sq: String,
    loc: {
      index: '2dsphere',
      type: "Mixed"
    }
  });

  console.log('Loading the schema');
  var Image = mongoose.model('image', ImageSchema);

  exports = module.exports = Image;