// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const db = require("./db");
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
// connect to mongoDB

console.log(loginIdUser);
console.log(loginIdComputer);


// connect to mongoose
db.connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

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
app.get("/medical-check", (req, res) => {
  res.render("medical-check", { title: "Dashboard", userLogin: loginIdUser, userLoggedIn: true, medicalCheckDataWeb: medicalCheckData});
});

app.get("/ssm-su", (req, res) => {
  res.render("index", { title: "SSM and SU Status", userLogin: loginIdUser, userLoggedIn: true });
});

app.get("/competency-management", (req, res) => {
  res.render("index", { title: "Competency management", userLogin: loginIdUser, userLoggedIn: true });
});

app.get("/", (req, res) => {
  res.render("index", { title: "Medical check", userLogin: loginIdUser, userLoggedIn: true });
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
app.get("/login", (req, res) => {
  res.render("login", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});
app.get("/profile", (req, res) => {
  res.render("profile", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
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
