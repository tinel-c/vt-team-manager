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

const userName = process.env['USERPROFILE'].split(path.sep)[2];
const computerName = process.env['COMPUTERNAME'];
const loginIdUser = path.join("domainName",userName);
const loginIdComputer = path.join("computerName",computerName);

console.log(loginIdUser);
console.log(loginIdComputer);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")))
/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
/**
 * Routes Definitions
 */
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
app.get("/user", (req, res) => {
  res.render("user", { title: "Profile", userProfile: loginIdUser, userComputer: loginIdComputer });
});
/**
 * Server Activation
 */
 app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
