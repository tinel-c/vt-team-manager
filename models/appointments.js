let mongoose = require ('mongoose');
// const Interval = require ('./interval')
// const timeZone = require('mongoose-timezone');

// mongoose.connect("mongodb://localhost:27017/testdb", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

let appointmentsSchema = new mongoose.Schema({
    Date:{
        type: Date,
        required: true
    },
    Starting_Hour:{
        type: Date,
        required: true
    },
    Ending_Hour:{
        type: Date,
        required: true
    },
    Expired:{
        type: Boolean,
        required: true
    },
    intervals:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Interval"
    }]

});

// appointmentsSchema.plugin(timeZone);
// const Programare = mongoose.model('appointments', appointmentsSchema);

// const seedDB = async () => {
//     const date = new Date(2021, 7, 4, 9, 24, 0);
//     const programare = new Programare({
//       Date: date,
//       Starting_Hour: date.setHours(12,0,0),
//       Ending_Hour: date.setHours(14,0,0)
//     });

//    for(let i = date.setHours(12,0,0); i<date.setHours(14,0,0); i+=10*60*1000){



  //    let interval = new Interval({
  //     Starting_Hour: i,
  //     Ending_Hour: i+10*60*1000,
  //     Name: ""
  //    });

  //   programare.intervals.push(
  //    interval
  //   );
  //   await interval.save();
  //  }
  //  await programare.save();




// }
// seedDB();
// console.log("am ajuns la final");

module.exports = mongoose.model('Appointments', appointmentsSchema);