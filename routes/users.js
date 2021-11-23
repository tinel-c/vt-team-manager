const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require('../models/users')

router.post('/signup', (req,res,next) => {
   const user = new User({
       _id: new mongoose.Types.ObjectId(),
       email_angajat: req.body.email_angajat
   });
});