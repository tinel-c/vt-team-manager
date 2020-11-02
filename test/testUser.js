#! /usr/bin/env node
const assert = require('chai').assert;
var async = require('async')
var user = require('../models/user')
const db = require('../db');

db.connect();

var users = []


function userCreate(first_name, family_name, uid, role, manager, cb) {
	userdetail = {
		first_name: first_name,
		family_name: family_name,
		uid: uid,
		role: role,
		manager: manager
	}

	var userInstance = new user(userdetail);

	userInstance.save(function(err) {
		if (err) {
			cb(err, null)
			return
		}
		console.log('New userInstance: ' + userInstance);
		users.push(userInstance)
		cb(null, userInstance)
	});
}

function createUsers(cb) {
	async.parallel([
			function(callback) {
				userCreate('Patrick', 'Rothfuss', 'uidl9703', 'team lead','uidl9784', callback);
			},
			function(callback) {
				userCreate('Ben', 'Bova', 'uidl9704', 'employee','uidl9784', callback);
			},
			function(callback) {
				userCreate('Isaac', 'Asimov', 'uidl9705', 'group lead','uidl9784', callback);
			},
			function(callback) {
				userCreate('Bob', 'Billings', 'uidl9706', 'employee','uidl9784', callback);
			},
			function(callback) {
				userCreate('Jim', 'Jones', 'uidl9707', 'employee','uidl9784', callback);
			}
		],
		// optional callback
		cb);
}


function executeDone(){
	console.log("Execution done");
}


describe('Test user database connector', function() {
  describe('Create entries inside the database', function() {
    it('It should create 5 users in the database', function() {
   		createUsers(executeDone);	   
    });
  });
});