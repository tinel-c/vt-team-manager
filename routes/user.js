var user = require('../models/user')
var express = require('express');
const db = require('../db');
var router = express.Router();

var mongoose = require('mongoose');



db.connect();


var users = []


/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('Respond from user');
});

// *** api routes *** //
router.get('/all', findAllUsers);
router.get('/findId/:id', findUserById);
router.get('/findByFirstName/:first_name', findUserByFirstName);
router.post('/add', addNewUser);
router.get('/addInline/:first_name/:family_name/:uid/:role/:manager', addNewUserInline);
router.put('/update/:id', updateUser);
router.get('/delete/:id', deleteUser);
router.get('/deleteAll', deleteAllUsers);

function callBackFunction(text, return_value) {
	console.log(return_value);
}

function userCreate(first_name, family_name, uid, role, email, manager, cb) {
	userdetail = {
		first_name: first_name,
		family_name: family_name,
		uid: uid,
		role: role,
		email: email,
		manager: manager,
		changedBy: "toBeReplaced"
	}

	var userInstance = new user(userdetail);

	userInstance.save(function(err) {
		if (err) {
			console.log('Error: ' + err);
			cb(err, null)
			return
		}
		console.log('New userInstance: ' + userInstance);
		users.push(userInstance)
		cb(null, userInstance)
	});
}


// *** get ALL users *** //
function findAllUsers(req, res) {
	user.find(function(err, users) {
		if (err) {
			res.json({
				'ERROR': err
			});
		} else {
			res.json(users);
		}
	});
}

// *** get SINGLE users *** //
function findUserById(req, res) {
	user.findById(req.params.id, function(err, blob) {
		if (err) {
			res.json({
				'ERROR': err
			});
		} else {
			res.json(blob);
		}
	});
}


// *** get SINGLE users *** //
function findUserByFirstName(req, res) {
	user.findOne({
		'first_name': req.params.first_name
	}, 'first_name family_name uid role _id', function(err, userInstance) {
		if (err) {
				res.json({
					'ERROR': err
				});
			} else {
				res.json({
					'FOUND': userInstance
				});
			}
		console.log(userInstance);
	});
}


// *** post one user *** //
function addNewUser(req, res) {
	userCreate(req.body.first_name,
		req.body.family_name,
		req.body.uid,
		req.body.role,
		req,body.email,
		function(err, result) {
			if (err) {
				res.json({
					'ERROR': err
				});
			} else {
				res.json({
					'ADD': result
				});
			}
		});
}

// *** post one user with a get inline request*** //
function addNewUserInline(req, res) {
	userCreate(req.params.first_name,
		req.params.family_name,
		req.params.uid,
		req.params.role,
		req.params.email,
		req.params.manager,
		function(err, result) {
			if (err) {
				res.json({
					'ERROR': err
				});
			} else {
				res.json({
					'ADD': result
				});
			}
		});
}

function updateUser(req, res) {
	user.findById(req.params.id, function(err, userInstance) {
		userInstance.first_name = req.body.first_name;
		userInstance.family_name = req.body.family_name;
		userInstance.uid = req.body.uid;
		userInstance.role = req.body.role;
		userInstance.email = req.body.email;
		userInstance.save(function(err) {
			if (err) {
				res.json({
					'ERROR': err
				});
			} else {
				res.json({
					'UPDATED': userInstance
				});
			}
		});
	});
}

// *** delete SINGLE user *** //
function deleteUser(req, res) {
	user.findById(req.params.id, function(err, userInstance) {
		if (err) {
			res.json({
				'ERROR': err
			});
		} else {
			userInstance.remove(function(err) {
				if (err) {
					res.json({
						'ERROR': err
					});
				} else {
					res.json({
						'REMOVED': userInstance
					});
				}
			});
		}
	});
}

// *** delete ALL user *** //
function deleteAllUsers(req, res) {
	// function to be removed in the live application
	console.log(">>>>>>>>>>>>> Delete all users!!!")
	user.remove({}, callBackFunction);
	console.log(">>>>>>>>>>>>> Delete all history!!!")
	res.json({
		'REMOVED': 'all'
	});
}


module.exports = router;