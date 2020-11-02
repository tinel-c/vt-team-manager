var mongoose = require('mongoose');
// include notification updates
var notification = require('./notification')
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    max: 100
  },
  family_name: {
    type: String,
    required: true,
    max: 100
  },
  uid: {
    type: String,
    required: true,
    max: 100
  },
  role: {
    type: String,
    required: true,
    max: 100
  },
  manager: {
    type: String,
    required: true,
    max: 100
  },
  changedBy: {
    type: String,
    required: false,
    max: 100
  }
});


// TODO add authenticated user in this session
UserSchema.pre('save', function(next) {
  // TODO replace addAutenticatedUSer with the real system registered user
  this.changedBy = 'addAutenticatedUser';
  notificationData = {
    notificationText: "Update the user: " + this.name,
    name: this.changedBy,
    date: Date.now(),
    changedBy: this.changedBy
  }

  var notificationInstance = new notification(notificationData);
  var numberOfEntries = 0;
  // Cap the number of entries to 15
  notification.countDocuments({}, function(err, numberOfEntries) {
    console.log('Number of entries in notifications is ' + numberOfEntries);
    // if intries are above 15 then erase the oldest entry
    if (numberOfEntries >= 15) {
      console.log("Detele the oldest entry.");
      notification.findOne({}, {}, {
        sort: {
          'created_at': 1
        }
      }, function(err, post) {
        console.log(post);
        if (err) {
          console.log(err)
        } else {
          post.remove();
          console.log("Removed post: " + post);
        }
      });
    }
  });

  console.log("Save the new notification.")
  notificationInstance.save(function(err) {
    if (err) {
      console.log('Error notificationInstance: ' + err);
      return
    }
    console.log('New notificationInstance: ' + notificationInstance);
  }); // update the notifications for the site

  next();
});

// Virtual for user name
UserSchema
  .virtual('name')
  .get(function() {
    return this.family_name + ', ' + this.first_name;
  });

// Virtual for user's URL
UserSchema
  .virtual('url')
  .get(function() {
    return '/user/' + this._id;
  });

//Export model
module.exports = mongoose.model('User', UserSchema);