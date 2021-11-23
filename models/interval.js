let mongoose = require ('mongoose');
const timeZone = require('mongoose-timezone');

let intervalSchema = new mongoose.Schema({
  Starting_Hour:{
    type: Date,
    required: true
  },
  Ending_Hour:{
    type: Date, 
    required: true
  },
  Name:{
    type: String
  }
});
intervalSchema.plugin(timeZone);
module.exports = mongoose.model('Interval', intervalSchema);