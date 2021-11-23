let mongoose = require ('mongoose');
//message schema
let emailSchema = new mongoose.Schema({
    emailMessage:{
      type: String,
      required: false
    },
    workdaysBeforeEmail:{
      type: String,
      required: false
    },
    emailTo:{
      type: String,
      required: false
    },
    emailSubject:{
      type: String,
      required: false
    },
    variable:{
      type: String,
      required: false
    }
});

module.exports = mongoose.model('mmcompanyemail', emailSchema);