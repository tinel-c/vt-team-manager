// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const db = require("./db");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
// routes
var user = require("./routes/user");
/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
const medicalCheckData = [
							["Constantin Bogza","10/25/2020","10/25/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 	["Monica Vlad","09/12/2020","09/12/2021","pending","Constantin Bogza","no"],
						 ];

var userLoginStatus = false;						 
// functions 

// Authentification
function authenticateToken(req, res, next) {
	// Gather the jwt access token from the request header
	const token = req.cookies.authcookie;
	if (token == null) {
		return res.render("login", { title: "Login" });
		// return res.sendStatus(401); // if there isn't any token
	}
  
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
	  console.log(err);
	  if (err) {
		req.loginStatus = false;
		return 
	  };
	  req.user = user;
	  req.loginStatus = true;
	  next(); // pass the execution off to whatever request the client intended
	});
  };
// Generate Access Token
function generateAccessToken(username) {
	// expires after half and hour (1800 seconds = 30 minutes)
	return jwt.sign(username, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
  }
// connect to mongoDB
dotenv.config();
// connect to mongoose
db.connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// add the middleware for cookies and json
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")));
/** expose the assets folders **/
app.use('/assets',express.static(path.join(__dirname, "assets")));
/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
/**
 * Routes Definitions for the database
 */
app.use('/user', user);
   
/**  Real pages  **/
/**  Static pages  **/
app.get("/medical-check", authenticateToken, (req, res) => {
	res.render("medical-check", { title: "Dashboard", userLogin: req.user, userLoggedIn: req.loginStatus, medicalCheckDataWeb: medicalCheckData, page: "Medical check", link: "medical-check"});
  });
  
  app.get("/ssm-su", authenticateToken, (req, res) => {
	res.render("ssm-su", { title: "SSM and SU Status", userLogin: req.user, userLoggedIn: req.loginStatus, page: "SSM and SU", link: "ssm-su" });
  });
  
  app.get("/competency-management", authenticateToken, (req, res) => {
	res.render("index", { title: "Competency management", userLogin: req.user, userLoggedIn: req.loginStatus, page: "Competency management", link: "competency-management" });
  });
  
  app.get("/", (req, res) => {
	  res.render("login", { title: "Login" });
  });
  
  app.get("/dashboard", authenticateToken, (req, res) => {
	  res.render("index", { title: "Dashboard", userLogin: req.user, userLoggedIn: req.loginStatus, page: "Dashboard", link: "dashboard"});
  });
  
  app.get("/profile", authenticateToken, (req, res) => {
	  res.render("profile", { title: "Profile", userLogin: req.user, userLoggedIn: req.loginStatus, page: "Profile", link: "profile" });
	});
  
  // login routing
  app.get("/login", (req, res) => {
	  res.render("login", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
	});
  
  app.get('/api/login', (req, res) => {
	  // ...
	  const token = generateAccessToken({ username: "test"}); //req.body.username });
	  res.cookie('authcookie',token,{maxAge:900000,httpOnly:true}) 
	  res.json(token);
	  // ...
	});
  
  app.get('/api/logout', (req, res) => {
	  // ...
	  res.cookie('authcookie',"0",{maxAge:0,httpOnly:true}) 
	  res.json("logout");
	  // ...
	});

/**
 * Server Activation
 */
 app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
