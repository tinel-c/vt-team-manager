let mongoose = require ('mongoose');
//userList schema
let usersSchema = new mongoose.Schema({
    Gid:{
    type: String,
    required: false
    },  
    First_Name:{
      type: String,
      required: false
    },  
    Family_Name:{
      type: String,
      required: false
    },
    Formal_Name:{
        type: String,
        required: false
    },
    Last_MM:{
        type: String,
        required: false
    },
    Next_MM:{
        type: String,
        required: false
    },
    Supervisor:{
        type: String,
        required: false
    },
    supervising:[{
      type: mongoose.Schema.Types.ObjectId,
      ref:"user"
    }],
    Medical_check_ok:{
        type: String,
        required: false
    },
    Medical_limitations:{
        type: String,
        required: false
    },
    email_angajat:{
        type: String,
        required: false
    },
    email_superior:{
        type: String,
        required: false
    },
    token:{
        type: String,
        required: false //va trebui sa fie true
    },
    token_vizibil:{
        type: String,
        required: false
    },
    days_until_next_MM:{
      type: String,
      required: false
    },
    permission:{
        type: String,
        required: false
    },
    register_verification:{
        type: String,
        required: false
    }
});

module.exports = mongoose.model('user', usersSchema);