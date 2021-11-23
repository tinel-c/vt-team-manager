var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
  notificationText: {
    type: String,
    required: true,
    max: 200
  },
  name: {
    type: String,
    required: true,
    max: 200
  },
  date: {
    type: Date,
    required: true,
    default: Date.now()
  },
  changedBy: {
    type: String,
    required: false,
    max: 100
  }
});


function displayTime(timeInSeconds) {
  if (timeInSeconds < 60) {
    return "" + timeInSeconds + " second(s) ago.";
  } else {
    if (timeInSeconds < 3600) {
      return "" + Math.floor(timeInSeconds / 60) + " minute(s) ago.";
    } else {
      if(timeInSeconds < (3600 * 24)) {
        return "" + Math.floor(timeInSeconds / 3600 ) + " hour(s) ago.";
      } else {
        return "" + Math.floor(timeInSeconds / (3600 * 24)) + " day(s) ago.";
      }
    }
  }
}

// TODO add authenticated Notification in this session
NotificationSchema.pre('save', function(next) {
  this.changedBy = 'addAutenticatedUSer';
  next();
});

// Virtual for Notification name
// This function will grab all the entries and format them for the 
// notification pannel inside the main site.
// TO DO: get the image of each user from the database
NotificationSchema
  .virtual('getNotificationEntry')
  .get(function() {
    return '<a class="list-group-item list-group-item-action" href="#!"><div class="row align-items-center"><div class="col-auto"><!-- Avatar--><img class="avatar rounded-circle" alt="Image placeholder" src="assets/img/theme/team-1.jpg"></div><div class="col ml--2"><div class="d-flex justify-content-between align-items-center"><div><h4 class="mb-0 text-sm">' +
            this.name + '</h4></div><div class="text-right text-muted"><small>' +
            displayTime(Math.floor((Date.now() - this.date) / 1000)) + '</small></div></div><p class="text-sm mb-0">' +
            this.notificationText + '</p></div></div></a>';
  });

// Virtual for Notification's URL
NotificationSchema
  .virtual('url')
  .get(function() {
    return '/notification/' + this._id;
  });

//Export model
module.exports = mongoose.model('Notification', NotificationSchema);