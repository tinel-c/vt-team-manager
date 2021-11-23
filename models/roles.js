let mongoose = require ('mongoose');
//userList schema
let rolesSchema = new mongoose.Schema({
  role:{
    type: String,
    required: false
  },
  medical_check_three_dots_popup:{
    type: String,
    required: false
  }
});

module.exports = mongoose.model('roles', rolesSchema);