var notification = require('../models/notification')
var express = require('express');
//const db = require('../db');
var router = express.Router();
var mongoose = require('mongoose');

//db.connect();
var notifications = []


/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('Respond from notification');
});

// *** api routes *** //
router.get('/all', getAllNotifications);
router.get('/notificationNo', getNoNotifications);
router.get('/addInline/:notificationText/:name/:changedBy/', addNewNotificationInline);
router.get('/deleteAll', deleteAllNotifications);
router.get('/allHtml', findAllHtmlNotifications);

function callBackFunction(text, return_value) {
	console.log(return_value);
}


function getAllNotifications(req, res) {
	notification.find(function(err, users) {
		if (err) {
			res.json({
				'ERROR': err
			});
		} else {
			res.json(users);
		}
	});
}


function notificationCreate(notificationText, name, changedBy, cb) {
	notificationDetail = {
		notificationText: notificationText,
		name: name,
		date: Date.now(),
		changedBy: changedBy,
	}

	var notificationInstance = new notification(notificationDetail);

	notificationInstance.save(function(err) {
		if (err) {
			console.log('Error: ' + err);
			cb(err, null)
			return
		}
		console.log('New notificationInstance: ' + notificationInstance);
		notifications.push(notificationInstance)
		cb(null, notificationInstance)
	});
}

function addNewNotificationInline(req, res) {
	notificationCreate(req.params.notificationText,
		req.params.name,
		req.params.changedBy,
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


// *** delete ALL user *** //
function deleteAllNotifications(req, res) {
	// function to be removed in the live application
	console.log(">>>>>>>>>>>>> Delete all notifications!!!")
	notification.remove({}, callBackFunction);
	res.json({
		'REMOVED': 'all'
	});
}

// *** get ALL notifications *** //
function findAllHtmlNotifications(req, res) {
	notification.find(function(err, notifications) {
		if (err) {
			res.json({
				'ERROR': err
			});
		} else {
			var htmlOutput = "";
			notifications.forEach(function(element) {
			htmlOutput = element.getNotificationEntry + htmlOutput;
			});
			res.send(htmlOutput);
		}
	});
}

// *** get ALL notifications *** //
function getNoNotifications(req, res) {
	notification.find(function(err, notifications) {
		if (err) {
			res.json({
				'ERROR': err
			});
		} else {
			res.json({
				'RESULT': notifications.length
			});
			
		}
	});
}
module.exports = router;