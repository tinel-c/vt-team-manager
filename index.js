// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";

//const userName = process.env['USERPROFILE'].split(path.sep)[2];
//const computerName = process.env['COMPUTERNAME'];
//const loginIdUser = path.join("domainName",userName);
//const loginIdComputer = path.join("computerName",computerName);
const loginIdUser = "test";
const loginIdComputer = "computerTest";

console.log(loginIdUser);
console.log(loginIdComputer);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
/** expose the assets folders **/
app.use('/assets',express.static(path.join(__dirname, "assets")));
app.use('/assets',express.static(path.join(__dirname, "assets")));
/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
/**
 * Routes Definitions
 */

 /**  Examples of pages and layout **/
app.get("/", (req, res) => {
  res.render("index", { title: "Home", userLogin: loginIdUser, userLoggedIn: true });
});
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
