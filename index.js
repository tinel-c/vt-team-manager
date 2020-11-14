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

const loginIdUser = "test";
const loginIdComputer = "computerTest";
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

// functions 

// Authentification
function authenticateToken(req, res, next) {
	// Gather the jwt access token from the request header
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return res.sendStatus(401); // if there isn't any token
  
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
	  console.log(err);
	  if (err) return res.sendStatus(403);
	  req.user = user;
	  next(); // pass the execution off to whatever request the client intended
	});
  };
// Generate Access Token
function generateAccessToken(username) {
	// expires after half and hour (1800 seconds = 30 minutes)
	return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
  }
// connect to mongoDB

console.log(loginIdUser);
console.log(loginIdComputer);

dotenv.config();
// connect to mongoose
db.connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");


app.use(bodyParser.json())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, "public")));
/** expose the assets folders **/
app.use('/assets',express.static(path.join(__dirname, "assets")));
app.use('/user', user);
/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
/**
 * Routes Definitions
 */

 /**  Examples of pages and layout **/
app.get("/medical-check", authenticateToken, (req, res) => {
  res.render("medical-check", { title: "Dashboard", userLogin: loginIdUser, userLoggedIn: true, medicalCheckDataWeb: medicalCheckData, page: "Medical check", link: "medical-check"});
});

app.get("/ssm-su",  (req, res) => {
  res.render("ssm-su", { title: "SSM and SU Status", userLogin: loginIdUser, userLoggedIn: true, page: "SSM and SU", link: "ssm-su" });
});

app.get("/competency-management", (req, res) => {
  res.render("index", { title: "Competency management", userLogin: loginIdUser, userLoggedIn: true, page: "Competency management", link: "competency-management" });
});

app.get("/", (req, res) => {
  res.render("index", { title: "Dashboard", userLogin: loginIdUser, userLoggedIn: true, page: "Dashboard", link: "dashboard"});
});

app.get("/dasboard", (req, res) => {
	res.render("index", { title: "Dashboard", userLogin: loginIdUser, userLoggedIn: true, page: "Dashboard", link: "dashboard"});
  });

app.get("/profile", (req, res) => {
	res.render("profile", { title: "Profile", userProfile: loginIdUser, userLoggedIn: true, page: "Profile", link: "profile" });
  });

// login routing
app.get("/login", (req, res) => {
	res.render("login", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
  });

app.post('/api/creteNewUser', (req, res) => {
	// ...
	const token = generateAccessToken({ username: req.body.username });
	res.json(token);
	// ...
  });

/** Dummy links to the templates to be removed at a later point **/

app.get("/user", (req, res) => {
  res.render("user", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});
app.get("/icons", (req, res) => {
  res.render("icons", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});
app.get("/map", (req, res) => {
  res.render("map", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});
app.get("/maps", (req, res) => {
  res.render("maps", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});
app.get("/dashboard", (req, res) => {
  res.render("dashboard", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});


app.get("/tables", (req, res) => {
  res.render("tables", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});
app.get("/register", (req, res) => {
  res.render("register", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});
app.get("/upgrade", (req, res) => {
  res.render("upgrade", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});

/**  Real pages  **/


/**
 * Server Activation
 */
 app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
