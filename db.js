const mongoose = require('mongoose');
var mongoDB =  "mongodb://localhost:27017/vt-team-management";


var state = {
	db: null,
};

exports.connect = function() {
	if (state.db) return;
	state.db = mongoDB;
	mongoose.connect(mongoDB, {useUnifiedTopology: true,useNewUrlParser: true});
	mongoose.Promise = global.Promise;
	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function() {
		console.log('We are connected to test database!');
	});
};


exports.get = function() {
	return state.db;
};

exports.close = function(done) {
	if (state.db) {
		state.db = null;
		state.mode = null;
		done();
	}
};