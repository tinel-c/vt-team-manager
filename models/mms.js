let mongoose = require ('mongoose');
//message schema
let messageSchema = new mongoose.Schema({
    emailMessage:{
      type: String,
      required: false
    },
    emailDay:{
      type: String,
      required: false
    },
    variable:{
      type: String,
      required: false
    }
});

module.exports = mongoose.model('mm', messageSchema);