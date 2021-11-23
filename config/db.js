// const mongoose = require('mongoose');
// var mongoDB =  "mongodb://localhost:27017/usersList3";


// var state = {
// 	db: null,
// };

// exports.connect = function() {
// 	if (state.db) return;
// 	state.db = mongoDB;
// 	mongoose.connect(mongoDB, {useUnifiedTopology: true,useNewUrlParser: true});
// 	mongoose.Promise = global.Promise;
// 	const db = mongoose.connection;
// 	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// 	db.once('open', function() {
// 		console.log('We are connected to test database!');
// 	});
// };


// exports.get = function() {
// 	return state.db;
// };

// exports.close = function(done) {
// 	if (state.db) {
// 		state.db = null;
// 		state.mode = null;
// 		done();
// 	}
// };

const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.log("Something went wrong with Database connection");
    process.exit(1);
  }
};

module.exports = connectDB;
