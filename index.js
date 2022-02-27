const express = require("express");
const path = require("path");
const session = require("express-session");
const hbs = require("express-handlebars");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
//const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const config = require("config");
const flash = require("express-flash");
// const isAuth = require("./middleware/is-auth");
const connectDB = require("./config/db");
const mongoURI = config.get("mongoURI");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const timeZone = require("mongoose-timezone");
var mongoXlsx = require("mongo-xlsx");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const Email = require("email-templates");
connectDB();

const dateToDate = require("./assets/js/medical-check-three-dots-form.js");
const lastMMDateToDate = require("./assets/js/medical-check-three-dots-form.js");
const reverseDateToDate = require("./assets/js/reverse-date.js");
const reverseMMDateToDate = require("./assets/js/reverse-MM-date.js");
const getInterval = require("./assets/js/get-interval.js");
const longYearDate = require("./assets/js/longYearDate.js");
const changeTimezones = require("./assets/js/changeTimezones.js");
const capitalizeTheFirstLetterOfEachWord = require("./assets/js/capitalizeTheFirstLetterOfEachWord.js");
/////////////////////////////////////////////////////////////////////////////////////
const store = new MongoDBStore({
  uri: mongoURI,
  collection: "mySessions",
});
/////////////////////////////////////////////////////////////////////////////////////

mongoose.connect("mongodb://localhost:27017/testdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db = mongoose.connection;

//Bring in models
let UsersList = require("./models/users");
let Appointments = require("./models/appointments");
let Interval = require("./models/interval");
let MM = require("./models/mms");
let Roles = require("./models/roles");
let MMCompanyEmail = require("./models/mmcompanyemails");
//check for db errors
db.on("error", function (err) {
  console.log(err);
});

//Check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

/////////////////////////////////////////////////////////////////////////////////////
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    req.session.error = "You have to Login first";
    return res.redirect("/");
  }
};
/////////////////////////////////////////////////////////////////////////////////////

function isRole(role) {
  return (req, res, next) => {
    // const user = await UsersList.findOne({ email_angajat: req.session.userEmail });
    // apelarea bazei de date in mod repetat va incetini aplicatia
    if (
      role == "basic" &&
      (req.session.role == "basic" ||
        req.session.role == "team leader" ||
        req.session.role == "admin" ||
        req.session.role == "medic" ||
        req.session.role == "esh manager")
    ) {
      console.log("ramura basic");
      return next();
    }
    if (
      role == "team leader" &&
      (req.session.role == "admin" || req.session.role == "team leader" ||
      req.session.role == "esh manager")
    ) {
      console.log("ramura team leader");
      return next();
    }
    if (role == "admin" && (req.session.role == "admin" ||
    req.session.role == "esh manager")) {
      console.log("ramura admin");
      return next();
    }
    if (
      role == "medic" &&
      (req.session.role == "medic" || req.session.role == "admin" ||
      req.session.role == "esh manager")
    ) {
      console.log("ramura medic"); //posibil sa trebuiasca sa modific astfel incat sa vada si team leader-ul
      return next();
    }
    if (role == "esh manager" && (req.session.role == "esh manager")) {
      console.log("ramura esh manager");
      return next();
    }
    res.status(401);
    return res.send("Not allowed");
  };
}

// let email = req.session.userEmail;
// let role = req.session.role;

// const isRole = (req, res, next) => {
//   if (req.session.isAuth) {
//     next();
//   } else {
//     req.session.error = "You have to Login first";
//     return res.redirect("/");
//   }
// };

// routes
var user = require("./routes/user");
var notification = require("./routes/notification");
/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";

var userLoginStatus = false;
// functions

// Authentification
function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const token = req.cookies.authcookie;
  if (token == null) {
    return res.redirect("/");
    //return res.render("login", { title: "Login" });
    return res.sendStatus(401); // if there isn't any token
  }
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log(err);
        req.loginStatus = false;
        return;
      }
      req.user = user;
      req.loginStatus = true;
      next(); // pass the execution off to whatever request the client intended
    });
  } catch (err) {
    // error to catch
  }
}
// Generate Access Token
function generateAccessToken(username) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(username, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFE,
  });
}
// connect to mongoDB
dotenv.config();
// connect to mongoose
//db.connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// add the middleware for cookies and json
app.engine("hbs", hbs({ extname: ".hbs" }));
app.set("view engine", "hbs");

/////////////////////////////////////////////
app.use(
  session({
    secret: "veryGoodSecret",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);
////////////////////////////////////////////////
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(
  passport.session({
    secret: "<add a secret string here>",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    debug: false,//true for the errors to be shown
  })
);
app.use(cors());

/** expose the assets folders **/
app.use("/assets", express.static(path.join(__dirname, "assets")));
/*
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
/*
 * Routes Definitions for the database
 */
app.use("/user", user);
app.use("/notification", notification);

app.use((req, res, next) => {
  res.locals.sessionUser = req.session;
  // console.log(req.session);
  next();
});

app.get(
  "/",
  /*isLoggedOut,*/ (req, res) => {
    //const error = req.session.error;
    //delete req.session.error;
    if (req.session.isAuth == true) return res.redirect("/dashboard");
    res.render("login");
  }
);

app.post("/", async (req, res) => {
  const { email_angajat, token } = req.body;
  const user = await UsersList.findOne({ email_angajat: email_angajat });
  if (!user) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login-failed");
  }
  const isMatch = await bcrypt.compare(token, user.token);
  if (!isMatch) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login-failed");
  }
  const year = 1000 * 60 * 60 * 24 * 365;
  // const year = 1000 * 10;
  req.session.isAuth = true;
  req.session.token = user.token;
  req.session.cookie.expires = new Date(Date.now() + year);
  req.session.userEmail = email_angajat;
  req.session.role = user.permission;
  req.session.formalName = user.Formal_Name;
  return res.redirect("/dashboard");
});

app.get(
  "/login-failed",
  /*isLoggedOut,*/ (req, res) => {
    //const error = req.session.error;
    //delete req.session.error;
    res.render("login-failed");
  }
);

app.post("/login-failed", async (req, res) => {
  const { email_angajat, token } = req.body;

  const user = await UsersList.findOne({ email_angajat: email_angajat });
  if (!user) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login-failed");
  }
  const isMatch = await bcrypt.compare(token, user.token);
  if (!isMatch) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login-failed");
  }
  const year = 1000 * 60 * 60 * 24 * 365;
  req.session.isAuth = true;
  req.session.token = user.token;
  req.session.cookie.expires = new Date(Date.now() + year);
  return res.redirect("/dashboard");
});

app.get("/add-user", (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render("add-user", { err: error, title: "Add user" });
});

//the login.post page
function getPassword() {
  let chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%%^&*()_+-=<,>./?;:'[{]}|";
  let passwordLength = 256;
  let password = "";

  for (let i = 0; i < passwordLength; i++) {
    let randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
}

app.post("/add-user", async (req, res) => {
  const email_angajat = req.body.email_angajat;
  const gid = req.body.Gid;

  let userWithSameGid = await UsersList.findOne({Gid: gid});
  if(userWithSameGid){
    console.log("this a user with this gid already exists");
    req.session.error = "User with this gid already exists";
    req.flash("error", "A user with this gid already exists :/");
    return res.redirect("/add-user");
  }

  // UNCOMMENT THIS FOR PRODUCTION
  // 🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧
  if (!email_angajat.includes("vitesco")){
    req.session.error = "Invalid email";
    req.flash("error", "The email address is invalid. It must contain @vitesco.com");
    return res.redirect("/add-user");
  }
  // 🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧
  // UNCOMMENT THIS FOR PRODUCTION

  //we will take razvan-stefan.iftimoaia11@vitesco.com as an example
  let firstName = email_angajat.substring(0, email_angajat.indexOf("."));
  // console.log(firstName);//output: razvan-stefan
  let lastName = email_angajat.substring(email_angajat.indexOf(".") + 1, email_angajat.indexOf("@"));
  // console.log(lastName);//output: iftimoaia11
  let lastNameWithNoDigits = lastName.replace(/[0-9]/g, '');
  // console.log(lastNameWithNoDigits);//output: iftimoaia


  let Formal_Name = "";
  if (lastNameWithNoDigits[lastNameWithNoDigits.length - 1] == " ") {
    Formal_Name = lastNameWithNoDigits + firstName;
  } else {
    Formal_Name = lastNameWithNoDigits + " " + firstName;
  }
  let auxiliar = capitalizeTheFirstLetterOfEachWord(Formal_Name);
  Formal_Name = auxiliar;
  auxiliar = capitalizeTheFirstLetterOfEachWord(firstName);
  firstName = auxiliar;
  auxiliar = capitalizeTheFirstLetterOfEachWord(lastNameWithNoDigits);
  lastName = auxiliar;
  // console.log("----------");
  console.log(Formal_Name);
  console.log(firstName);
  console.log(lastName);
  console.log(gid);

  // return res.redirect("/add-user");

  let token = getPassword();
  let token_vizibil = token;

  let user = await UsersList.findOne({
    email_angajat: email_angajat,
    register_verification: "1",
  });
  if (user) {
    req.session.error = "User already exists";
    req.flash("error", "This user already exists :/");
    return res.redirect("/add-user");
  }

  //checking if there are other users with the same name in the database 
  let regex = new RegExp(Formal_Name, "i");
  let otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}}); //regex was used so we can match UserName with UserName Gid
  console.log("-----------------------------");
  console.log(otherUsersWithSameName[0]);
  console.log("-----------------------------");
  if(otherUsersWithSameName[0]){ //if there are other users with the same name
    Formal_Name = Formal_Name + " " + gid;
    let usersCounter = await UsersList.find({Formal_Name: { $regex: regex}}).countDocuments();
    for( let i = 0; i < usersCounter; i++ ){//updating all users' Formal_Name (addint their Gid in the Formal_Name)
      let otherUserFirst_Name = otherUsersWithSameName[i].First_Name;
      let otherUserFamily_Name = otherUsersWithSameName[i].Family_Name;
      let otherUserGid = otherUsersWithSameName[i].Gid;
      let otherUserFormal_Name = otherUserFamily_Name + " " + otherUserFirst_Name + " " + otherUserGid;
      let otherUserId = otherUsersWithSameName[i]._id;
      db.collection("users").updateOne(
        { _id: otherUserId },
        {
          $set: {
            Formal_Name: otherUserFormal_Name,
          },
        }
      );
    }
  }

  let user2 = await UsersList.findOne({
    email_angajat: email_angajat,
    register_verification: "0", //if the user already exists in the database but they dont have an active account in the application
  });
  if (user2) {
    console.log("-----------------------");
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(token, salt, function (err, hasdPsw) {
        if (err) return next(err);
        db.collection("users").updateOne(
          { email_angajat: email_angajat },
          {
            $set: {
              token: hasdPsw,
              token_vizibil: token_vizibil,
              permission: "basic",
              register_verification: "1",
              // Gid: gid,
            },
          }
        );

        // user2 = {
        //   token: hasdPsw,
        //   token_vizibil: token_vizibil,
        //   permission: "basic",
        //   register_verification: "1"
        // };
        //user2.save();
        //save();
        sendRegisterEmail(email_angajat, token_vizibil);
        return res.redirect("/");
      });
    });
  } else {
    console.log(token); //a valid person that does not exist in the db wants to create an accout 
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(token, salt, function (err, hasdPsw) {
        if (err) return next(err);
        const newUser = new UsersList({
          Gid: gid,
          Formal_Name: Formal_Name,
          First_Name: firstName,
          Family_Name: lastName,
          email_angajat: email_angajat,
          Last_MM: "-",
          Next_MM: "-",
          email_superior: "-",
          Supervisor:"-",
          Medical_limitations: "-",
          token: hasdPsw,
          token_vizibil: token_vizibil,
          permission: "basic",
          register_verification: "1",
        });
        newUser.save();
        sendRegisterEmail(email_angajat, token_vizibil);
        return res.redirect("/");
      });
    });
  }


});

function sendRegisterEmail(sendTo, sendToken) {
  console.log("The email function has been reached !!");
  const transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
      user: "razvaniftimoaia20@yahoo.ro",
      pass: "_email_password_here_",
    },
  });
  const options = {
    from: "razvaniftimoaia20@yahoo.ro",
    to: sendTo,
    subject: "User registered successfully !!",
    text: "Acesta este tokenul unic pentru logarea pe site: " + sendToken,
  };
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("sent:" + info.response);
    console.log("The email was sent successfully !!");
  });
}

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect("/");
    return res.redirect("/");
  });
});

function dateToPoints(date) {
  let year = date.slice(7, 9);
  let luna = date.slice(3, 6);
  let day = date.slice(0, 2);
  const variabila = `${luna}-${day}-${year}`;
  return new Date(variabila);
}

app.get("/medical-check", isAuth, async (req, res) => {
  let roles = await Roles.find({}); //actualizam drepturile de pe aceasta sesiune
  if (roles != "") {
    //daca roles exista
    // console.log("roles exista");
    let sessionRole = req.session.role;
    let roles2 = await Roles.findOne({ role: sessionRole });
    req.session.medical_check_three_dots_popup =
      roles2.medical_check_three_dots_popup;
  } else {
    const newBasicRole = new Roles({
      role: "basic",
      medical_check_three_dots_popup: "0",
    });
    newBasicRole.save();
    const newAdminRole = new Roles({
      role: "admin",
      medical_check_three_dots_popup: "1",
    });
    newAdminRole.save();
    const newTeamLeaderRole = new Roles({
      role: "team leader",
      medical_check_three_dots_popup: "0",
    });
    newTeamLeaderRole.save();
    const newMedicRole = new Roles({
      role: "medic",
      medical_check_three_dots_popup: "0",
    });
    newMedicRole.save();
    // nu merge sa asignam drepturile rolului respectiv sesiunii inca
    // baza de date trebuie creata intai
  }

  let usersLists = await UsersList.find({});
  let usersCount = await UsersList.find({}).countDocuments();
  let date1 = new Date();
  for (let i = 0; i < usersCount; i++) {
    let aux = usersLists[i].email_angajat;
    if (usersLists[i].Next_MM == "-") {
      // usersLists[i].days_until_next_MM == 0;
      db.collection("users").updateOne(
        { email_angajat: aux },
        {
          $set: {
            days_until_next_MM: 0,
          },
        }
      );
    } else {
      let date2 = new Date(usersLists[i].Next_MM);
      if (date1 > date2) {
        const diffTime2 = Math.abs(date2 - date1);
        const diffDays2 = 0 - Math.ceil(diffTime2 / (1000 * 60 * 60 * 24)) + 1;
        // diffDays2 = 0 - diffDays2;
        // usersLists[i].days_until_next_MM == 0;
        db.collection("users").updateOne(
          { email_angajat: aux },
          {
            $set: {
              days_until_next_MM: diffDays2,
            },
          }
        );
      } else {
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // usersLists[i].days_until_next_MM == diffDays;
        db.collection("users").updateOne(
          { email_angajat: aux },
          {
            $set: {
              days_until_next_MM: diffDays,
            },
          }
        );
      }
    }
  }
  usersLists = await UsersList.find({});
  // days_until_next_MM

  for (let i = 0; i < usersCount; i++) {
    let aux = usersLists[i].email_angajat;
    if (usersLists[i].Next_MM == "-" && usersLists[i].Last_MM == "-") {
      db.collection("users").updateOne(
        { email_angajat: aux },
        {
          $set: {
            Medical_check_ok: 0,
          },
        }
      );
    } else {
      if (dateToPoints(usersLists[i].Next_MM) < Date.now()) {
        db.collection("users").updateOne(
          { email_angajat: aux },
          {
            $set: {
              Medical_check_ok: 0,
            },
          }
        );
      } else {
        db.collection("users").updateOne(
          { email_angajat: aux },
          {
            $set: {
              Medical_check_ok: 1,
            },
          }
        );
      }
    }
  }

  const {
    formalName,
    employeeEmail,
    dateMedicalCheck,
    dueDateMedicalCheck,
    status,
    expiration,
    searchManager,
    searchManagerEmail,
    searchName,
    searchEmail,
  } = req.query;
  let usersLists2 = 0;
  if (formalName) {
    usersLists = await UsersList.find({}).sort({
      Formal_Name: formalName === "asc" ? 1 : -1,
    });
  }
  if (employeeEmail) {
    usersLists = await UsersList.find({}).sort({
      email_angajat: employeeEmail === "asc" ? 1 : -1,
    });
  }
  if (searchManager && searchManager != "") {
    const regex = new RegExp(searchManager, "i");
    usersLists = await UsersList.find({ Supervisor: { $regex: regex } });
  }
  if (searchManagerEmail) {
    const regex = new RegExp(searchManagerEmail, "i");
    usersLists = await UsersList.find({ email_superior: { $regex: regex } });
  }
  if (searchName) {
    const regex = new RegExp(searchName, "i");
    usersLists = await UsersList.find({ Formal_Name: { $regex: regex } });
  }
  if (searchEmail) {
    const regex = new RegExp(searchEmail, "i");
    usersLists = await UsersList.find({ email_angajat: { $regex: regex } });
  }
  if (status) {
    usersLists = await UsersList.find({}).sort({
      Medical_check_ok: status === "asc" ? 1 : -1,
    });
  }
  if (expiration) {
    usersLists = await UsersList.find({}).sort({
      days_until_next_MM: expiration === "asc" ? 1 : -1,
    });
  }
  if (dateMedicalCheck === "asc") {
    let pivotCounter = 0;
    usersLists = await UsersList.find({});
    usersCount = await UsersList.find({}).countDocuments();
    usersLists2 = usersLists;
    while (pivotCounter < usersCount - 1) {
      let ok = true; // consideram ca pivotul e chiar minimul din sir
      let min = pivotCounter;
      for (let i = pivotCounter; i < usersCount; i++) {
        if (
          dateToPoints(usersLists2[min].Last_MM) >
          dateToPoints(usersLists2[i].Last_MM)
        ) {
          min = i;
          ok = false;
        }
      }
      if (ok === false) {
        [usersLists2[pivotCounter], usersLists2[min]] = [
          usersLists2[min],
          usersLists2[pivotCounter],
        ];
      }
      pivotCounter++;
    }
    usersLists = usersLists2;
  } else if (dateMedicalCheck === "desc") {
    let pivotCounter = 0;
    usersLists = await UsersList.find({});
    usersCount = await UsersList.find({}).countDocuments();
    usersLists2 = usersLists;
    while (pivotCounter < usersCount - 1) {
      let ok = true; // consideram ca pivotul e chiar maximul din sir
      let max = pivotCounter;
      for (let i = pivotCounter; i < usersCount; i++) {
        if (
          dateToPoints(usersLists2[max].Last_MM) <
          dateToPoints(usersLists2[i].Last_MM)
        ) {
          max = i;
          ok = false;
        }
      }
      if (ok === false) {
        [usersLists2[pivotCounter], usersLists2[max]] = [
          usersLists2[max],
          usersLists2[pivotCounter],
        ];
      }
      pivotCounter++;
    }
    usersLists = usersLists2;
  }
  if (dueDateMedicalCheck === "asc") {
    let pivotCounter = 0;
    usersLists = await UsersList.find({});
    usersCount = await UsersList.find({}).countDocuments();
    usersLists2 = usersLists;
    while (pivotCounter < usersCount - 1) {
      let ok = true; // consideram ca pivotul e chiar minimul din sir
      let min = pivotCounter;
      for (let i = pivotCounter; i < usersCount; i++) {
        if (
          dateToPoints(usersLists2[min].Next_MM) >
          dateToPoints(usersLists2[i].Next_MM)
        ) {
          min = i;
          ok = false;
        }
      }
      if (ok === false) {
        [usersLists2[pivotCounter], usersLists2[min]] = [
          usersLists2[min],
          usersLists2[pivotCounter],
        ];
      }
      pivotCounter++;
    }
    usersLists = usersLists2;
  } else if (dueDateMedicalCheck === "desc") {
    let pivotCounter = 0;
    usersLists = await UsersList.find({});
    usersCount = await UsersList.find({}).countDocuments();
    usersLists2 = usersLists;
    while (pivotCounter < usersCount - 1) {
      let ok = true; // consideram ca pivotul e chiar maximul din sir
      let max = pivotCounter;
      for (let i = pivotCounter; i < usersCount; i++) {
        if (
          dateToPoints(usersLists2[max].Next_MM) <
          dateToPoints(usersLists2[i].Next_MM)
        ) {
          max = i;
          ok = false;
        }
      }
      if (ok === false) {
        [usersLists2[pivotCounter], usersLists2[max]] = [
          usersLists2[max],
          usersLists2[pivotCounter],
        ];
      }
      pivotCounter++;
    }
    usersLists = usersLists2;
  }
  const last_mm_dates = usersLists.map((user) => {
    return dateToDate(user.Last_MM);
  });
  const next_mm_dates = usersLists.map((user) => {
    return lastMMDateToDate(user.Next_MM);
  });
  // console.log(last_mm_dates);
  res.render("medical-check", {
    usersLists: usersLists,
    last_mm_date: last_mm_dates,
    next_mm_date: next_mm_dates,
  });
});

app.post("/medical-check", async (req, res) => {
  // let Next_MM = req.body.Next_MM;
  let Last_MM = req.body.Last_MM;
  console.log(Last_MM);
  let email_angajat = req.body.email_angajat;
  let Medical_limitations = req.body.Medical_limitations;
  let Next_MM = new Date(Last_MM);
  let Next_MM_String;
  Next_MM.setFullYear(Next_MM.getFullYear()+1);
  Next_MM_String = Next_MM.getFullYear() + '-' + ('0' + (Next_MM.getMonth()+1)).slice(-2) + '-' + ('0' + Next_MM.getDate()).slice(-2);
  // console.log(Next_MM);
  // Next_MM.setFullYear(Next_MM.getFullYear()+1);
  // console.log(Next_MM);


  // console.log("---------");
  // var MyDate = new Date();
  // console.log(MyDate);
  // var MyDateString;
  // MyDate.setFullYear(MyDate.getFullYear()+1);
  // MyDateString = MyDate.getFullYear() + '-' + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-' + ('0' + MyDate.getDate()).slice(-2);
  // console.log(MyDateString);
  // console.log("---------");


  const last_mm_date = reverseDateToDate(Last_MM);
  const next_mm_date = reverseDateToDate(Next_MM_String);
  // console.log(next_mm_date + " ------ " + last_mm_date + " ------ " + email_angajat);
  db.collection("users").updateOne(
    { email_angajat: email_angajat },
    {
      $set: {
        Next_MM: next_mm_date,
        Last_MM: last_mm_date,
        Medical_limitations: Medical_limitations,
      },
    }
  );
  return res.redirect("/medical-check");
});

async function sendReminderEmail() {
  let today = new Date();
  let yyyy = today.getFullYear() - 2000;
  const users = await UsersList.find({});
  users.forEach((user) => {
    let aux = user.Next_MM;
    let expiration_yyyy = aux.slice(7 - 9);
    let dif = expiration_yyyy - yyyy;
    let luna = user.Next_MM[3] + user.Next_MM[4] + user.Next_MM[5];
    if (dif === 0) {
      if (luna == "Jan" || luna == "jan") {
        luna = 1;
      }
      if (luna == "Feb" || luna == "feb") {
        luna = 2;
      }
      if (luna == "Mar" || luna == "mar") {
        luna = 3;
      }
      if (luna == "Apr" || luna == "apr") {
        luna = 4;
      }
      if (luna == "May" || luna == "may") {
        luna = 5;
      }
      if (luna == "Jun" || luna == "jun") {
        luna = 6;
      }
      if (luna == "Jul" || luna == "jul") {
        luna = 7;
      }
      if (luna == "Aug" || luna == "aug") {
        luna = 8;
      }
      if (luna == "Sep" || luna == "sep") {
        luna = 9;
      }
      if (luna == "Oct" || luna == "oct") {
        luna = 10;
      }
      if (luna == "Nov" || luna == "nov") {
        luna = 11;
      }
      if (luna == "Dec" || luna == "dec") {
        luna = 12;
      }
      let luna_actuala = today.getMonth() + 1;
      luna_actuala = 7; ////////////////////////////////
      dif = luna - luna_actuala;
      if (dif == 1) {
        let ziuaActuala = today.getUTCDate();
        let zileRamase = 31 - ziuaActuala;
        let ziuaExpirarii = user.Next_MM[0] + user.Next_MM[1];
        zileRamase += parseInt(ziuaExpirarii);
        if (zileRamase <= 31) {
          console.log("trimite mailul de pe ramura 1");
          sendMMEmail(user.email_angajat, user.Next_MM, user.Formal_Name);
          sendMMToSupervisorEmail(user.email_superior, user.Next_MM, user.Formal_Name);
        }
      } else if (dif == 0) {
        let ziuaActuala = today.getUTCDate();
        let ziuaExpirarii = user.Next_MM[0] + user.Next_MM[1];
        let zileRamase = parseInt(ziuaExpirarii) - ziuaActuala;
        if (zileRamase <= 31) {
          console.log("trimite mailul de pe ramura 2");
          sendMMEmail(user.email_angajat, user.Next_MM, user.Formal_Name);
          sendMMToSupervisorEmail(user.email_superior, user.Next_MM, user.Formal_Name);
        }
      }
    } else if (dif === 1 && (luna == "Jan" || luna == "jan")) {
      if (/*(today.getMonth()+1)*/ 12 == 12) {
        //daca e decembrie si MM expira in ianuarie
        let ziuaActuala = today.getUTCDate();
        ziuaActuala = 08; //////////////////////
        let zileRamase = 31 - ziuaActuala;
        let ziuaExpirarii = user.Next_MM[0] + user.Next_MM[1];
        zileRamase += parseInt(ziuaExpirarii);
        if (zileRamase <= 36) {
          console.log("trimite mailul de pe ramura 3");
          sendMMEmail(user.email_angajat, user.Next_MM, user.Formal_Name);
          sendMMToSupervisorEmail(user.email_superior, user.Next_MM, user.Formal_Name);
        }
      }
    }
  });
}

app.get("/export-table", async (req, res) => {
  // res.status(200)
  //       .attachment("name.txt")
  //       .send('This is the content')

  let usersLists = await UsersList.find(
    {},
    {
      Formal_Name: 1,
      email_angajat: 1,
      Last_MM: 1,
      Next_MM: 1,
      Medical_check_ok: 1,
      days_until_next_MM: 1,
      Supervisor: 1,
      email_superior: 1,
      Medical_limitations: 1,
      _id: 0,
    }
  );
  var model = mongoXlsx.buildDynamicModel(usersLists);
  /* Generate Excel */
  mongoXlsx.mongoData2Xlsx(
    usersLists,
    model,
    { fileName: "tabel-MM.xlsx" },
    function (err, usersLists) {
      console.log("File saved at:", usersLists.fullPath);
      res.download(usersLists.fullPath);
      setTimeout(function () {
        try {
          fs.unlinkSync(usersLists.fullPath);
        } catch (e) {
          console.log("this is a good error");
        }
      }, 1000);
    }
  );
});

app.get("/send-reminder-email", async (req, res) => {
  let today = new Date();
  let yyyy = today.getFullYear() - 2000;
  const users = await UsersList.find({});
  users.forEach((user) => {
    let aux = user.Next_MM;
    let expiration_yyyy = aux.slice(7 - 9);
    let dif = expiration_yyyy - yyyy;
    let luna = user.Next_MM[3] + user.Next_MM[4] + user.Next_MM[5];
    if (dif === 0) {
      if (luna == "Jan" || luna == "jan") {
        luna = 1;
      }
      if (luna == "Feb" || luna == "feb") {
        luna = 2;
      }
      if (luna == "Mar" || luna == "mar") {
        luna = 3;
      }
      if (luna == "Apr" || luna == "apr") {
        luna = 4;
      }
      if (luna == "May" || luna == "may") {
        luna = 5;
      }
      if (luna == "Jun" || luna == "jun") {
        luna = 6;
      }
      if (luna == "Jul" || luna == "jul") {
        luna = 7;
      }
      if (luna == "Aug" || luna == "aug") {
        luna = 8;
      }
      if (luna == "Sep" || luna == "sep") {
        luna = 9;
      }
      if (luna == "Oct" || luna == "oct") {
        luna = 10;
      }
      if (luna == "Nov" || luna == "nov") {
        luna = 11;
      }
      if (luna == "Dec" || luna == "dec") {
        luna = 12;
      }
      let luna_actuala = today.getMonth() + 1;
      luna_actuala = 7; ////////////////////////////////
      dif = luna - luna_actuala;
      if (dif == 1) {
        let ziuaActuala = today.getUTCDate();
        let zileRamase = 31 - ziuaActuala;
        let ziuaExpirarii = user.Next_MM[0] + user.Next_MM[1];
        zileRamase += parseInt(ziuaExpirarii);
        if (zileRamase <= 31) {
          console.log("trimite mailul de pe ramura 1");
          sendMMEmail(user.email_angajat, user.Next_MM, user.Formal_Name);
          sendMMToSupervisorEmail(user.email_superior, user.Next_MM, user.Formal_Name);
        }
      } else if (dif == 0) {
        let ziuaActuala = today.getUTCDate();
        let ziuaExpirarii = user.Next_MM[0] + user.Next_MM[1];
        let zileRamase = parseInt(ziuaExpirarii) - ziuaActuala;
        if (zileRamase <= 31) {
          console.log("trimite mailul de pe ramura 2");
          sendMMEmail(user.email_angajat, user.Next_MM, user.Formal_Name);
          sendMMToSupervisorEmail(user.email_superior, user.Next_MM, user.Formal_Name);
        }
      }
    } else if (dif === 1 && (luna == "Jan" || luna == "jan")) {
      if (/*(today.getMonth()+1)*/ 12 == 12) {
        //daca e decembrie si MM expira in ianuarie
        let ziuaActuala = today.getUTCDate();
        ziuaActuala = 08; //////////////////////
        let zileRamase = 31 - ziuaActuala;
        let ziuaExpirarii = user.Next_MM[0] + user.Next_MM[1];
        zileRamase += parseInt(ziuaExpirarii);
        if (zileRamase <= 31) {
          console.log("trimite mailul de pe ramura 3");
          sendMMEmail(user.email_angajat, user.Next_MM, user.Formal_Name);
          sendMMToSupervisorEmail(user.email_superior, user.Next_MM, user.Formal_Name);
        }
      }
    }
  });
  return res.redirect("/medical-check");
});

// functie ce testeaza functia de email

// schedule.scheduleJob(`57 22 * * WED`, async () => {
//   await sendMMEmail("razvan-stefan.iftimoaia@vitesco.com", "26-Aug-21", "Razvan-Stefan Iftimoaia");
// });

async function sendMMEmail(sendTo, dueDate, name) {
  let auxMMDay = await MM.findOne({ variable: 1 });
  let MMtextMessage = "";
  if (auxMMDay) {
    MMtextMessage = auxMMDay.emailMessage;
    function countOccurences(string, word) {
      return string.split(word).length - 1;
    }
    let countFN = countOccurences(MMtextMessage, "${name}"); // 2
    let countNM = countOccurences(MMtextMessage, "${expirationDate}");
    for (let i = 0; i < countFN; i++) {
      MMtextMessage = MMtextMessage.replace("${name}", name);
    }
    for (let i = 0; i < countNM; i++) {
      MMtextMessage = MMtextMessage.replace("${expirationDate}", dueDate);
    }
    console.log(MMtextMessage);
  } else {
    MMtextMessage = "Atentie !! Pe " + dueDate + " va expira MM !!";
  }

  console.log("The email function has been reached !!");
  const transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
      user: "razvaniftimoaia20@yahoo.ro",
      pass: "_email_password_here_",
    },
  });
  const options = {
    from: "razvaniftimoaia20@yahoo.ro",
    to: sendTo,
    subject: "Despre medicina muncii",
    text: MMtextMessage,
  };
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("sent:" + info.response);
    console.log("The email was sent successfully !!");
  });
}

async function sendMMToSupervisorEmail(sendTo, dueDate, name) {
  // let auxMMDay = await MM.findOne({ variable: 1 });
  MMtextMessage = "Atentie !! Pe " + dueDate + " va expira controlul medical al lui " + name + ". Un mesaj de informare a fost trimis si catre acesta/aceasta";

  console.log("The email function has been reached !!");
  const transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
      user: "razvaniftimoaia20@yahoo.ro",
      pass: "_email_password_here_",
    },
  });
  const options = {
    from: "razvaniftimoaia20@yahoo.ro",
    to: sendTo,
    subject: "Despre medicina muncii",
    text: MMtextMessage,
  };
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("sent:" + info.response);
    console.log("The email was sent successfully !!");
  });
}

function sendAppointmentEmail(sendTo, Formal_Name, appointmentDate) {
  let appointmentsDate = new Date(appointmentDate);
  let appointmentsDate2 = new Date();

  function getFullMinutes(thisDate) {
    if (thisDate.getMinutes() < 10) return "0" + thisDate.getMinutes();
    return thisDate.getMinutes();
  }
  function getFullMonth(thisDate) {
    if (thisDate.getMonth() < 9) return "0" + (thisDate.getMonth() + 1);
    return thisDate.getMonth() + 1;
  }
  function getFullDate(thisDate) {
    if (thisDate.getDate() < 10) return "0" + thisDate.getDate();
    return thisDate.getDate();
  }

  appointmentsDate2.setTime(appointmentsDate.getTime() + 10 * 60 * 1000);
  console.log("The email function has been reached !!");
  const transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
      user: "razvaniftimoaia20@yahoo.ro",
      pass: "_email_password_here_",
    },
  });
  const options = {
    from: "razvaniftimoaia20@yahoo.ro",
    to: sendTo,
    subject: "Programare medicina muncii",
    text:
      Formal_Name +
      " a fost programat pentru medicina muncii pe data de " +
      getFullDate(appointmentsDate) +
      "." +
      getFullMonth(appointmentsDate) +
      "." +
      appointmentsDate.getFullYear() +
      " in intervalul orar: " +
      appointmentsDate.getHours() +
      ":" +
      getFullMinutes(appointmentsDate) +
      " - " +
      appointmentsDate2.getHours() +
      ":" +
      getFullMinutes(appointmentsDate2),
  };
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("sent:" + info.response);
    console.log("The email was sent successfully !!");
  });
}

// let medicalCheck = await MM.findOne({ variable: 1 });
//   let mmDay = "MON";
//   let mmText = "Medicina muncii va expira curand";
//   if (medicalCheck){
//     mmDay = medicalCheck.emailDay;
//     mmText = medicalCheck.emailMessage;
//   }
// schedule.scheduleJob("0 11 * * FRI", async () => {
//   await sendReminderEmail();
// });

schedule.scheduleJob(`* * * * *`, async () => {//it checks every minute 
  let auxMMDay = await MM.findOne({ variable: 1 });
  let timeStar = "WED";
  let hourStar = "8";
  let minuteStar = "0";
  let auxTimeStar = auxMMDay.emailDay; //it will store a value like MON / TUE / WED etc..
  let auxHourStar = auxMMDay.emailHour;//it will store a value like 08:00
  if (auxTimeStar) { //if the week day is not null
    timeStar = auxTimeStar;
  }
  if (auxHourStar) { //if the hour and minutes are not null
    hourStar = auxHourStar[0] + auxHourStar[1];
    minuteStar = auxHourStar[3] + auxHourStar[4];
  }

  var d = new Date();//get current date and time
  const weekday = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  let day = weekday[d.getDay()];

  if(day == timeStar && d.getMinutes() == minuteStar && d.getHours() == hourStar){ //sends emails to those who their medical check is going to expire in less than 60 days
    // console.log("am verificat functia si se pot trimite mail-urile");
    await sendReminderEmail();
  } else {
    // console.log("s-a verificat functia insa nu era momentul");
  }
});



app.get("/programare-MM", isAuth, async (req, res) => {

  let sessionEmail = req.session.userEmail;
  let currentUserName = await UsersList.findOne({email_angajat: sessionEmail});
  // console.log(currentUserName.Formal_Name);
  let userIntervals = await Interval.find({Name: currentUserName.Formal_Name});

  let usersLists = await UsersList.find({});
  //updating the Expired field
  let apps = await Appointments.find({});
  let appsCount = await Appointments.find({}).countDocuments();
  for (let i = 0; i < appsCount; i++) {
    if (apps[i].Ending_Hour < new Date()) apps[i].Expired = true;
    else apps[i].Expired = false;
    await apps[i].save();
  }
  //sorting the appointments chronologically
  let appointments = await Appointments.find({ Expired: false }).populate({
    path: "intervals",
  });
  let pivotCounter = 0;
  let appointmentsCount = await Appointments.find({
    Expired: false,
  }).countDocuments();
  while (pivotCounter < appointmentsCount - 1) {
    let ok = true; // consideram ca pivotul e chiar minimul din sir
    let min = pivotCounter;
    for (let i = pivotCounter; i < appointmentsCount; i++) {
      if (appointments[min].Date > appointments[i].Date) {
        min = i;
        ok = false;
      }
    }
    if (ok === false) {
      [appointments[pivotCounter], appointments[min]] = [
        appointments[min],
        appointments[pivotCounter],
      ];
    }
    pivotCounter++;
  }
  res.render("programare-MM", {
    userIntervals: userIntervals,
    currentUserName: currentUserName.Formal_Name,
    usersLists: usersLists,
    appointments: appointments,
  });
});

app.post("/programare-MM", async (req, res) => {
  
  // const Formal_Name = req.body.Formal_Name;

  const email_angajat = req.body.email_angajat;
  let user = await UsersList.findOne({email_angajat: email_angajat});
  // console.log(user);
  const Formal_Name = user.Formal_Name;
  console.log(Formal_Name);
  const timeSlot = req.body.timeSlot;
  const users = await UsersList.find({});
  let appointments = await Appointments.find({ Expired: false }).populate({
    path: "intervals",
  });
  // let appointments = await Appointments.find({});
  let appointmentsCount = await Appointments.find({
    Expired: false,
  }).countDocuments();
  if (timeSlot) {
    //stergem vechea programare pentru a o inlocui ulterior.
    let today = new Date();
    let oldInterval = await Interval.findOne({Name: Formal_Name , Starting_Hour: {"$gte" : today}});
    if(oldInterval){
      Interval.findOne({ Name: Formal_Name , Starting_Hour: {"$gte" : today} }, function (error, person) {
        console.log("This interval will get deleted " + person);
        person.remove();
      });
    }

    //cautam ziua pentru programare si salvam index-ul ei
    let appointmentIndex = null;
    let myDate = new Date(timeSlot);
    let diff = myDate.getTimezoneOffset();
    let ok = myDate.getTime() + diff * 1000 * 60;

    for (let i = 0; i < appointmentsCount; i++) {
      let ddate = appointments[i].Starting_Hour;
      if (
        // comparam fiecare zi pentru control medical cu ziua aleasa de user
        ddate.getDate() == myDate.getDate() &&
        ddate.getMonth() == myDate.getMonth() &&
        ddate.getFullYear() == myDate.getFullYear()
      ) {
        appointmentIndex = i;
      }
    }

    //verific daca persoana respectiva s-a mai programat o data in ziua aceea
    // for (let val of appointments[appointmentIndex].intervals) {
    //   if (val.Name == Formal_Name) {
    //     req.flash("error", "You can't make more than one appointment a day");
    //     return res.redirect("/admin-programare-MM");
    //   }
    // }

    // cream noul interval de programare
    let interval = new Interval({
      Starting_Hour: new Date(ok),
      Ending_Hour: new Date(ok + 10 * 60 * 1000),
      Name: Formal_Name,
    });
    appointments[appointmentIndex].intervals.push(interval);
    await interval.save();
    await appointments[appointmentIndex].save();
    
    // informam angajatul prin mail
    sendAppointmentEmail(email_angajat, Formal_Name, ok);
    for (let user of users) {
      //trimite mail si superiorului
      if (
        user.Formal_Name == Formal_Name &&
        user.email_angajat == email_angajat
      ) {
        sendAppointmentEmail(user.email_superior, Formal_Name, ok);
      }
    }
  }
  console.log(
    Formal_Name +
      " cu adresa de email " +
      email_angajat +
      " s-a programat pentru MM pe data de " +
      timeSlot
  );
  return res.redirect("/dashboard");
});

app.post("/delete-programare-MM", async (req, res) => {
  let deleteInterval = new Date(req.body.deleteTimeSlot);
  let deleteIntervalEmail = req.session.userEmail;
  let username = await UsersList.findOne({email_angajat: deleteIntervalEmail})
  Formal_Name = username.Formal_Name;

  function changeTimezone(date, ianatz) {
    var invdate = new Date(
      date.toLocaleString("en-US", {
        timeZone: ianatz,
      })
    );
    var diff = date.getTime() - invdate.getTime();
    return new Date(date.getTime() + diff);
  }

  let finalDate = changeTimezone(deleteInterval, "UTC");
  let userIntervals = await Interval.findOne({Name: Formal_Name , Starting_Hour:finalDate});
  appointmentId = userIntervals._id;
  Interval.findOne({ Name: Formal_Name , Starting_Hour:finalDate }, function (error, person) {
    console.log("This interval will get deleted " + person);
    person.remove();
  });
  
  // console.log(appointmentId);
  // console.log("-_-_-_-_-");
  // let midnight = new Date(req.body.deleteTimeSlot);
  // midnight.setHours(0, 0, 0, 0);
  // midnight = changeTimezone(midnight, "UTC");
  // console.log(midnight);
  // let apps = await Appointments.find({ Date: midnight }).populate({
  //   path: "intervals",
  // });
// ramane ID ul de la interval in appointments.intervals chiar si dupa ce este sters!! (insa nu afecteaza cu nimic aplicatia)
  return res.redirect("/programare-MM");
});


app.get("/edit-user", isAuth, async (req, res) => {
  let sessionEmail = req.session.userEmail; 
  let currentUser = await UsersList.findOne({email_angajat: sessionEmail});
  let allUsers = await UsersList.find({});
  let next_MM = currentUser.Next_MM;
  next_MM = longYearDate(next_MM);
  
  res.render("edit-user", {
    usersLists: allUsers,
    currentUser: currentUser,
    next_MM: next_MM
  });
});

app.post("/edit-user", async (req, res) => {
  let Formal_Name = req.body.Formal_Name;
  let Old_Formal_Name = Formal_Name; //pastram vechiul Formal_Name
  let user2 = await UsersList.findOne({
    Formal_Name: Formal_Name,
  }).populate({
    path: "supervising",
  });
  let gid = user2.Gid;
  let userId = user2._id; // pastram id-ul celui ce avea Formal_Name inainte sa se schimbe

  let firstName = req.body.firstName;
  let familyName = req.body.familyName;
  firstName = firstName.replace(/\s+/g, " ");
  familyName = familyName.replace(/\s+/g, " ");
  if(firstName.indexOf("-")!=-1){
    firstName = firstName.replace(/ /g,''); //eliminates white spaces
  }

  Formal_Name = "";
  if (familyName[familyName.length - 1] == " ") {
    Formal_Name = familyName + firstName;
  } else {
    Formal_Name = familyName + " " + firstName;
  }
  let auxiliar = capitalizeTheFirstLetterOfEachWord(Formal_Name);
  Formal_Name = auxiliar;
  auxiliar = capitalizeTheFirstLetterOfEachWord(firstName);
  firstName = auxiliar;
  auxiliar = capitalizeTheFirstLetterOfEachWord(familyName);
  familyName = auxiliar;
  if(Formal_Name[Formal_Name.length - 1] == " "){
    Formal_Name = Formal_Name.substring(0, Formal_Name.length - 1);//se elimina spatiul de la finalul stringului
  }
  if(firstName[firstName.length - 1] == " "){
    firstName = firstName.substring(0, firstName.length - 1);
  }
  if(familyName[familyName.length - 1] == " "){
    familyName = familyName.substring(0, familyName.length - 1);
  }
  let Formal_Name2 = Formal_Name; //we will use Formal_Name2 later on for checking if there still are other users with this exact name

  // let user = await UsersList.findOne({
  //   Formal_Name: Formal_Name
  // });
  // if (user && (Formal_Name != Old_Formal_Name)) {
  //   // console.log("this user already exists");
  //   req.session.error = "User already exists";
  //   req.flash("error", "A user with this name already exists :/");
  //   return res.redirect("/admin-edit-user");
  // }


  //checking if the new name is not a part of the old name
  //ex: John Doe is also a part of John Doedoe
  //thus we must consider this case
  db.collection("users").updateOne(//firstly we will assign the new Formal_Name and after we will check if adding the Gid is necessary
    { _id: userId },
    {
      $set: {
        Formal_Name: Formal_Name,
      },
    }
  );


  //checking if there are other users with the same name in the database 
  let regex = new RegExp(Formal_Name, "i");
  let Formal_Name_Copy = Formal_Name;
  let otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}}); //regex was used so we can match UserName with UserName Gid
  if(otherUsersWithSameName[1]){ //if there are other users with the same name
    Formal_Name = Formal_Name + " " + gid;
    let usersCounter = await UsersList.find({Formal_Name: { $regex: regex}}).countDocuments();
    for( let i = 0; i < usersCounter; i++ ){//updating all users' Formal_Name (addint their Gid in the Formal_Name)
      let otherUserFirst_Name = otherUsersWithSameName[i].First_Name;
      let otherUserFamily_Name = otherUsersWithSameName[i].Family_Name;
      let otherUserGid = otherUsersWithSameName[i].Gid;
      let otherUserFormal_Name = otherUserFamily_Name + " " + otherUserFirst_Name + " " + otherUserGid;
      let otherUserId = otherUsersWithSameName[i]._id;
      db.collection("users").updateOne(
        { _id: otherUserId },
        {
          $set: {
            Formal_Name: otherUserFormal_Name,
          },
        }
      );
    }
  }

  //if the user changed their name, we must edit the "supervisor" field of every user that is being supervised by them
  for( let j = 0 ; j < user2.supervising.length ; j++ ){
    db.collection("users").updateOne(
      { _id: user2.supervising[j]._id },
      {
        $set: {
          Supervisor: Formal_Name,
        },
      }
    );
  }


  let email_angajat = req.body.email_angajat;
  let Supervisor = req.body.Supervisor;
  let email_superior = req.body.email_superior;
  let restrictions = req.body.Restrictions;
  let Last_MM = req.body.Last_MM;
  
  let Next_MM = new Date(Last_MM);
  let Next_MM_String;
  Next_MM.setFullYear(Next_MM.getFullYear()+1);
  Next_MM_String = Next_MM.getFullYear() + '-' + ('0' + (Next_MM.getMonth()+1)).slice(-2) + '-' + ('0' + Next_MM.getDate()).slice(-2);

  let real_last_mm = reverseDateToDate(Last_MM);
  let real_next_mm = reverseDateToDate(Next_MM_String);


  // UNCOMMENT THIS FOR PRODUCTION
  // ❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
  // if (!email_angajat.includes("vitesco")){
  //   req.session.error = "Invalid email";
  //   req.flash("error", "The email address is invalid. It must contain @vitesco.com");
  //   return res.redirect("/admin-edit-user");
  // }
  // ❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
  // UNCOMMENT THIS FOR PRODUCTION


  if(user2.Supervisor != Supervisor){ //verificam daca se doreste schimbarea superviser-ului
    console.log("se doreste schimbarea superviser-ului");
    if((Supervisor == "-") || (Supervisor == "")){
      console.log("userul nu va avea niciun superior");
      let oldSupervisor = await UsersList.findOne({
        email_angajat: user2.email_superior,
      }).populate({
        path: "supervising",
      });
      console.log(oldSupervisor);
      for( let j = 0 ; j < oldSupervisor.supervising.length ; j++ ){
        //trebuie folosit stringify pentru ca JS nu poate compara doua obiecte
        if(JSON.stringify(oldSupervisor.supervising[j]._id) === JSON.stringify(user2._id)){
          oldSupervisor.supervising.splice(j,1);
          await oldSupervisor.save();
        }
      }
    }
    else 
    {
      console.log("userul va avea un superior");
      if( (user2.email_superior == "-") || (user2.email_superior == "")){
        //daca userul nu avea superior inainte, dam direct push fara splice
        let newSupervisor = await UsersList.findOne({
          email_angajat: email_superior,
        }).populate({
          path: "supervising",
        });
        newSupervisor.supervising.push(user2._id);
        await newSupervisor.save();
      } 
      else 
      {
      //prima data mergem la vechiul superviser si dam splice la id
      let oldSupervisor = await UsersList.findOne({
        email_angajat: user2.email_superior,
      }).populate({
        path: "supervising",
      });
      console.log(oldSupervisor);
      for( let j = 0 ; j < oldSupervisor.supervising.length ; j++ ){
        //trebuie folosit stringify pentru ca JS nu poate compara doua obiecte
        if(JSON.stringify(oldSupervisor.supervising[j]._id) === JSON.stringify(user2._id)){
          oldSupervisor.supervising.splice(j,1);
          await oldSupervisor.save();
        }
      }
      //acum ca am taiat id-ul userului ce vrea sa fie editat din array-ul superiorului lui, vom merge la noul superior si vom da push cu id-ul userului
      let newSupervisor = await UsersList.findOne({
        email_angajat: email_superior,
      }).populate({
        path: "supervising",
      });
      newSupervisor.supervising.push(user2._id);
      await newSupervisor.save();
    }
    }
  } else {
    console.log("nu se doreste schimbarea superviser-ului");
  }


  if (user2) {
    db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          email_angajat: email_angajat,
          First_Name: firstName,
          Family_Name: familyName,
          Supervisor: Supervisor,
          email_superior: email_superior,
          Medical_limitations: restrictions,
          Last_MM: real_last_mm,
          Next_MM: real_next_mm,
          Formal_Name: Formal_Name,
        },
      }
    );
  }
  if(Old_Formal_Name != Formal_Name){ //daca am schimbat numele angajatului, abia atunci sa updateze numele si in intervale
    let Old_Name_Intervals = await Interval.find({
      Name: Old_Formal_Name,
    });
    for(let i = 0; i < Old_Name_Intervals.length; i++){
      db.collection("intervals").updateOne(
        { _id: Old_Name_Intervals[i]._id },
        {
          $set: {
            Name: Formal_Name
          },
        }
      );
    }
  }

  // console.log("am updatat numele din intervale");
  // console.log("----------------");

   //after editing the user we will update the other users' Formal_Name (if it is the case)
   Formal_Name = Old_Formal_Name;
   regex = new RegExp(Formal_Name, "i");
   otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}}); //regex was used so we can match UserName with UserName Gid
   if(otherUsersWithSameName[1]){//if there are at least two users with the same name, we keep the gid in the name
     return res.redirect("/edit-user"); //no changes are needed
   } else if (otherUsersWithSameName[0]){//if there is only one user with that name, the Gid must be deleted
     let lastUserId = otherUsersWithSameName[0]._id;
     let lastUserFirst_Name = otherUsersWithSameName[0].First_Name;
     let lastUserFamily_Name = otherUsersWithSameName[0].Family_Name;
     let lastUserFormal_Name = lastUserFamily_Name + " " + lastUserFirst_Name;
     db.collection("users").updateOne(
       { _id: lastUserId },
       {
         $set: {
           Formal_Name: lastUserFormal_Name,
         },
       }
     );
     return res.redirect("/edit-user");
   } else {
     return res.redirect("/edit-user");
   }
});


app.get("/admin-page", isAuth, async (req, res) => {
  res.render("admin-page");
});

app.post("/admin-page", async (req, res) => {});



app.get("/admin-programare-MM", isAuth, async (req, res) => {
  let sessionEmail = req.session.userEmail;
  let currentUserName = await UsersList.findOne({email_angajat: sessionEmail});
  // console.log(currentUserName.Formal_Name);
  let userIntervals = await Interval.find({Name: currentUserName.Formal_Name});

  let usersLists = await UsersList.find({});
  //updating the Expired field
  let apps = await Appointments.find({});
  let appsCount = await Appointments.find({}).countDocuments();
  for (let i = 0; i < appsCount; i++) {
    if (apps[i].Ending_Hour < new Date()) apps[i].Expired = true;
    else apps[i].Expired = false;
    await apps[i].save();
  }
  //sorting the appointments chronologically
  let appointments = await Appointments.find({ Expired: false }).populate({
    path: "intervals",
  });
  let pivotCounter = 0;
  let appointmentsCount = await Appointments.find({
    Expired: false,
  }).countDocuments();
  while (pivotCounter < appointmentsCount - 1) {
    let ok = true; // consideram ca pivotul e chiar minimul din sir
    let min = pivotCounter;
    for (let i = pivotCounter; i < appointmentsCount; i++) {
      if (appointments[min].Date > appointments[i].Date) {
        min = i;
        ok = false;
      }
    }
    if (ok === false) {
      [appointments[pivotCounter], appointments[min]] = [
        appointments[min],
        appointments[pivotCounter],
      ];
    }
    pivotCounter++;
  }
  res.render("admin-programare-MM", {
    userIntervals: userIntervals,
    currentUserName: currentUserName.Formal_Name,
    usersLists: usersLists,
    appointments: appointments,
  });
});

app.post("/admin-programare-MM", isAuth, async (req, res) => {
  const Formal_Name = req.body.Formal_Name;
  const email_angajat = req.body.email_angajat;
  const timeSlot = req.body.timeSlot;
  const users = await UsersList.find({});
  let appointments = await Appointments.find({ Expired: false }).populate({
    path: "intervals",
  }); // cautam zilele cu programari care sunt inca valide si le populam cu programari
  let appointmentsCount = await Appointments.find({
    Expired: false,
  }).countDocuments(); //numaram cate zile de genul avem
  if (timeSlot) {
    //stergem vechea programare pentru a o inlocui ulterior.
    let today = new Date();
    let oldInterval = await Interval.findOne({Name: Formal_Name , Starting_Hour: {"$gte" : today}});
    if(oldInterval){
      Interval.findOne({ Name: Formal_Name , Starting_Hour: {"$gte" : today} }, function (error, person) {
        console.log("This interval will get deleted " + person);
        person.remove();
      });
    }

    //cautam ziua pentru programare si salvam index-ul ei
    let appointmentIndex = null;
    let myDate = new Date(timeSlot);
    let diff = myDate.getTimezoneOffset();
    let ok = myDate.getTime() + diff * 1000 * 60;

    for (let i = 0; i < appointmentsCount; i++) {
      let ddate = appointments[i].Starting_Hour;
      if (
        // comparam fiecare zi pentru control medical cu ziua aleasa de user
        ddate.getDate() == myDate.getDate() &&
        ddate.getMonth() == myDate.getMonth() &&
        ddate.getFullYear() == myDate.getFullYear()
      ) {
        appointmentIndex = i;
      }
    }

    //verific daca persoana respectiva s-a mai programat o data in ziua aceea
    // for (let val of appointments[appointmentIndex].intervals) {
    //   if (val.Name == Formal_Name) {
    //     req.flash("error", "You can't make more than one appointment a day");
    //     return res.redirect("/admin-programare-MM");
    //   }
    // }

    // cream noul interval de programare
    let interval = new Interval({
      Starting_Hour: new Date(ok),
      Ending_Hour: new Date(ok + 10 * 60 * 1000),
      Name: Formal_Name,
    });
    appointments[appointmentIndex].intervals.push(interval);
    await interval.save();
    await appointments[appointmentIndex].save();
    
    // informam angajatul prin mail
    sendAppointmentEmail(email_angajat, Formal_Name, ok);
    for (let user of users) {
      //trimite mail si superiorului
      if (
        user.Formal_Name == Formal_Name &&
        user.email_angajat == email_angajat
      ) {
        sendAppointmentEmail(user.email_superior, Formal_Name, ok);
      }
    }
  }
  console.log(
    Formal_Name +
      " cu adresa de email " +
      email_angajat +
      " s-a programat pentru MM pe data de " +
      timeSlot
  );
  // ramane ID ul de la interval in appointments.intervals chiar si dupa ce este sters!! (insa nu afecteaza cu nimic aplicatia)
  return res.redirect("/admin-programare-MM");
});

app.post("/admin-delete-programare-MM", async (req, res) => {
  let deleteInterval = new Date(req.body.deleteTimeSlot);
  console.log("am primit intervalul care trebuie sters:");
  console.log(deleteInterval);
  // let deleteIntervalEmail = req.body.formalNameForDeletedAppointment;
  let Formal_Name = req.body.formalNameForDeletedAppointment;
  // let username = await UsersList.findOne({email_angajat: deleteIntervalEmail})
  // Formal_Name = username.Formal_Name;

  function changeTimezone(date, ianatz) {
    var invdate = new Date(
      date.toLocaleString("en-US", {
        timeZone: ianatz,
      })
    );
    var diff = date.getTime() - invdate.getTime();
    return new Date(date.getTime() + diff);
  }

  let finalDate = changeTimezone(deleteInterval, "UTC");
  let userIntervals = await Interval.findOne({Name: Formal_Name , Starting_Hour:finalDate});
  appointmentId = userIntervals._id;
  Interval.findOne({ Name: Formal_Name , Starting_Hour:finalDate }, function (error, person) {
    console.log("This interval will get deleted " + person);
    person.remove();
  });
  
  // console.log(appointmentId);
  // console.log("-_-_-_-_-");
  // let midnight = new Date(req.body.deleteTimeSlot);
  // midnight.setHours(0, 0, 0, 0);
  // midnight = changeTimezone(midnight, "UTC");
  // console.log(midnight);
  // let apps = await Appointments.find({ Date: midnight }).populate({
  //   path: "intervals",
  // });
// ramane ID ul de la interval in appointments.intervals chiar si dupa ce este sters!! (insa nu afecteaza cu nimic aplicatia)
  return res.redirect("/admin-programare-MM");
});

app.get("/get-users-appointments", isAuth, async (req, res) => {
  const {selectedName} = req.query;
  // console.log(selectedName);
  let today = new Date();
  let intervals = await Interval.find({Name: selectedName, Starting_Hour: {
      "$gte" : today
    }
  });

  console.log(intervals);
  // const tomorrow = new Date(interval);

  // // Add 1 Day
  // tomorrow.setDate(tomorrow.getDate() + 1);
  // // console.log(tomorrow);

  // let intervals = await Interval.find({Starting_Hour: {
  //   "$gte" : interval, 
  //   "$lt" : tomorrow 
  //   }
  // });
  // // console.log(intervals);

  if(intervals == "[]"){
    res.send("0");
  } else {
    res.send(intervals);
  }
  

});


//isRole("team leader")
app.get("/admin-add-user", isAuth, async (req, res) => {
  const usersList = await UsersList.find({register_verification: "1"});
  // pastram in supervisoriFinal toti supervisorii aparand o singura data
  let supervisori = [];
  let i = 0;
  let usersCounter = await UsersList.find({register_verification: "1"}).countDocuments();
  for (let j = 0; j < usersCounter; j++) {
    let decoy = supervisori.push(`${usersList[j].Supervisor}`);
  }
  let supervisoriFinal = [];
  for (let sup in supervisori) {
    let ok = 0;
    for (let j in supervisoriFinal) {
      if (supervisori[sup] == supervisoriFinal[j]) {
        ok = 1;
        break;
      }
    }
    if (ok == 0) {
      let decoy = supervisoriFinal.push(`${supervisori[sup]}`);
    }
  }
  // console.log(supervisoriFinal);

  res.render("admin-add-user", {
    usersLists: usersList,
    supervisori: supervisoriFinal,
  });
});

app.post("/admin-add-user", async (req, res) => {
  let gid = req.body.Gid;
  //first we check if anyboy else has this gid
  let userWithSameGid = await UsersList.findOne({Gid: gid});
  if(userWithSameGid){
    console.log("this a user with this gid already exists");
    req.session.error = "User with this gid already exists";
    req.flash("error", "A user with this gid already exists :/");
    return res.redirect("/admin-add-user");
  }

  let First_Name = req.body.First_Name;
  let Family_Name = req.body.Family_Name;
  First_Name = First_Name.replace(/\s+/g, " ");
  if(First_Name.indexOf("-")!=-1){
    First_Name = First_Name.replace(/ /g,''); //eliminates all white spaces only if there exists a dash (-)
  }
  Family_Name = Family_Name.replace(/\s+/g, " ");


  let email_angajat = req.body.email_angajat;


  // UNCOMMENT THIS FOR PRODUCTION
  // 🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧
  if (!email_angajat.includes("vitesco")){
    req.session.error = "Invalid email";
    req.flash("error", "The email address is invalid. It must contain @vitesco.com");
    return res.redirect("/admin-add-user");
  }
  // 🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧
  // UNCOMMENT THIS FOR PRODUCTION


  let superEmail = "-";
  let Supervisor = req.body.Supervisor;
  if( Supervisor != "-"){
  let supervisorEmail = await UsersList.findOne({
    Formal_Name: Supervisor,
  });
  superEmail = supervisorEmail.email_angajat;
  console.log(superEmail);
  }

  let token = getPassword();
  let token_vizibil = token;
  //ne asiguram ca numele sunt scrise cu majuscule
  function capitalizeTheFirstLetterOfEachWord(words) {
    // 
    var separateWord = words.toLowerCase().split("-");
    // var separateWord = words.toLowerCase().split("-").join(" ").split(" ") ;
    for (var i = 0; i < separateWord.length; i++) {
      separateWord[i] = separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
    }
    let word = separateWord.join("-");
    // console.log(word);
    let separateWord2 = word.split(" ");
    for (var i = 0; i < separateWord2.length; i++) {
      separateWord2[i] = separateWord2[i].charAt(0).toUpperCase() + separateWord2[i].substring(1);
    }
    let word2 = separateWord2.join(" ");
    let separateWord3 = word2.split(" ");
    for (var i = 0; i < separateWord3.length; i++) {
      separateWord3[i] = separateWord3[i].charAt(0).toUpperCase() + separateWord3[i].substring(1);
    }
    let word3 = separateWord3.join(" ");
    return word3;
  }

  let Formal_Name = "";
  if (Family_Name[Family_Name.length - 1] == " ") {
    Formal_Name = Family_Name + First_Name;
  } else {
    Formal_Name = Family_Name + " " + First_Name;
  }
  let auxiliar = capitalizeTheFirstLetterOfEachWord(Formal_Name);
  Formal_Name = auxiliar;
  auxiliar = capitalizeTheFirstLetterOfEachWord(First_Name);
  First_Name = auxiliar;
  auxiliar = capitalizeTheFirstLetterOfEachWord(Family_Name);
  Family_Name = auxiliar;
  // console.log("----------");
  // console.log(First_Name + "|");
  // console.log(Family_Name + "|");
  // console.log(Formal_Name + "|");

  let user = await UsersList.findOne({
    email_angajat: email_angajat,
    register_verification: "1",
  });
  if (user) { // checking if the user already exists
    console.log("this user already exists");
    req.session.error = "User already exists";
    req.flash("error", "This user already exists :/");
    return res.redirect("/admin-add-user");
  }

  //checking if there are other users with the same name in the database 
  let regex = new RegExp(Formal_Name, "i");
  let otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}}); //regex was used so we can match UserName with UserName Gid
  if(otherUsersWithSameName[0]){ //if there are other users with the same name
    Formal_Name = Formal_Name + " " + gid;
    let usersCounter = await UsersList.find({Formal_Name: { $regex: regex}}).countDocuments();
    for( let i = 0; i < usersCounter; i++ ){//updating all users' Formal_Name (addint their Gid in the Formal_Name)
      let otherUserFirst_Name = otherUsersWithSameName[i].First_Name;
      let otherUserFamily_Name = otherUsersWithSameName[i].Family_Name;
      let otherUserGid = otherUsersWithSameName[i].Gid;
      let otherUserFormal_Name = otherUserFamily_Name + " " + otherUserFirst_Name + " " + otherUserGid;
      let otherUserId = otherUsersWithSameName[i]._id;
      db.collection("users").updateOne(
        { _id: otherUserId },
        {
          $set: {
            Formal_Name: otherUserFormal_Name,
          },
        }
      );
    }
  }

  async function assignUserToSupervisor(userId, supervisorEmail){ //this function is used later to push the new user's id into the "supervising" field of the supervisor
    if ( supervisorEmail != "-"){
      console.log(userId);
      console.log(supervisorEmail);
      let supervisors = await UsersList.find({ email_angajat: supervisorEmail }).populate({
        path: "supervising",
      });
      console.log(supervisors[0]);
      supervisors[0].supervising.push(userId);
      await supervisors[0].save();
    } else {
      console.log("utilizatorul nu are supervisor");
    }
  }

  let idUser = "";
  let user2 = await UsersList.findOne({
    email_angajat: email_angajat,
    register_verification: "0",
  });

  if (user2) {
    console.log("---- Updating an user.. ----");
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(token, salt, function (err, hasdPsw) {
        if (err) return next(err);
        db.collection("users").updateOne(
          { email_angajat: email_angajat },
          {
            $set: {
              token: hasdPsw,
              Formal_Name: Formal_Name,
              First_Name: First_Name,
              Family_Name: Family_Name,
              token_vizibil: token_vizibil,
              permission: "basic",
              register_verification: "1",
            },
          }
        );
        idUser = user2._id;
        assignUserToSupervisor(idUser, superEmail);
        sendRegisterEmail(email_angajat, token_vizibil);
      });
    });
  } else {
    console.log("---setting up a new user---");
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(token, salt, function (err, hasdPsw) {
        if (err) return next(err);
        const newUser = new UsersList({
          Gid: gid,
          email_angajat: email_angajat,
          Formal_Name: Formal_Name,
          First_Name: First_Name,
          Family_Name: Family_Name,
          Supervisor: Supervisor,
          email_superior: superEmail,
          Last_MM: "-",
          Next_MM: "-",
          Medical_limitations: "-",
          token: hasdPsw,
          token_vizibil: token_vizibil,
          permission: "basic",
          register_verification: "1",
        });
        newUser.save();
        let idUser = newUser._id;
        assignUserToSupervisor(idUser, superEmail);
        sendRegisterEmail(email_angajat, token_vizibil);
      });
    });
  }
  
  return res.redirect("/dashboard");
});

app.get("/admin-delete-user", isAuth, async (req, res) => {

  //this part is for selecting only the inferior nodes
  let currentUserEmail =  req.session.userEmail;
  let currentUser = await UsersList.findOne({
    email_angajat: currentUserEmail
  });
  //this function will store the IDs of the inferior nodes in an array which we will use later
  async function parseTree(userId){
    let user = await UsersList.findOne({
      _id: userId
    }).populate({
      path: "supervising",
    });
    let numberOfSupervisedUsers =  user.supervising.length;
    if (numberOfSupervisedUsers == 0){ 
      return;
    }
    // console.log(numberOfSupervisedUsers);
    for( let i = 0; i < numberOfSupervisedUsers ; i++ ){
      // console.log(user.supervising[i]._id);
      allIDs.push(user.supervising[i]._id);
      await parseTree(user.supervising[i]._id);
    }
  }
  await parseTree(currentUser._id);
  // console.log(allIDs);
  let users = await UsersList.find({
    '_id':{
      $in: allIDs
    }
  });
  allIDs = []; //resetting the value of the global variable "allIDs"

  res.render("admin-delete-user", {
    usersLists: users,
  });
});

app.post("/admin-delete-user", async (req, res) => {
  let email_angajat = req.body.email_angajat;
  let Formal_Name = req.body.Formal_Name;


  // console.log(email_angajat);
  // console.log(Formal_Name);
  //pentru a usura explicarea procesului vom rezuma procesul la un arbore pe 3 nivele. Pe nivelul 2 este angajatul pe care urmeaza sa il stergem, pe 1 superiorul acestuia iar pe 3 angajatii supervizati de cel de pe 2. Inainte de a sterge userul, vom asigna toti angajatii de pe nivelul 3 celui de pe nivelul 1.

  let user = await UsersList.findOne({
    Formal_Name: Formal_Name,
  }); //avem userul de pe nivelul 2
  let userFirst_Name = user.First_Name;
  let userFamily_Name = user.Family_Name;
  let userGid = user.Gid;
  let mailSuperior = user.email_superior; 
  if(user.email_superior == "-"){ //daca nimerim varful piramidei (cineva fara superior)
    let numberOfSupervisedUsers = user.supervising.length;
    for( let i = 0 ; i < numberOfSupervisedUsers ; i++ ){
      db.collection("users").updateOne(
        { _id: user.supervising[i]._id },
        {
          $set: {
            Supervisor: "-",
            email_superior: "-",
          },
        }
      );
    }
  }
  else
  {
    let supervisor = await UsersList.findOne({
      email_angajat: mailSuperior,
    }).populate({
      path: "supervising",
    }); //avem userul de pe nivelul 1
    let numberOfSupervisedUsers = user.supervising.length; //salvam numarul de useri care sunt supravegheati de cel de pe nivelul 2

    for( let i = 0 ; i < numberOfSupervisedUsers ; i++ ){
      //luam userii de pe nivelul 3 unul cate unul si le schimbam superviser-ul
      db.collection("users").updateOne(
        { _id: user.supervising[i]._id },
        {
          $set: {
            Supervisor: supervisor.Formal_Name,
            email_superior: supervisor.email_angajat,
          },
        }
      );
      
      //adaugam userul de pe nivelul 3 in lista "supervising" a celui de pe nivelul 1
      supervisor.supervising.push(user.supervising[i]._id);
      await supervisor.save();

      //stergem id-ul userului de pe nivelul 2 din array-ul celui de pe nivelul 1
      for( let j = 0 ; j < supervisor.supervising.length ; j++ ){
        //trebuie folosit stringify pentru ca JS nu poate compara doua obiecte
        if(JSON.stringify(supervisor.supervising[j]._id) === JSON.stringify(user._id)){
          supervisor.supervising.splice(j,1);
          await supervisor.save();
        }
      }
    }
  }

  await UsersList.findOne({ email_angajat: email_angajat }, async function (error, person) {
    // console.log("This object will get deleted " + person);
    await person.remove();
  });

  //after deleting the user we will update the other users' Formal_Name (if it is the case)
  Formal_Name = userFamily_Name + " " + userFirst_Name;
  let regex = new RegExp(Formal_Name, "i");
  let otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}}); //regex was used so we can match UserName with UserName Gid
  if(otherUsersWithSameName[1]){//if there are at least two users with the same name, we keep the gid in the name
    return res.redirect("/admin-delete-user"); //no changes are needed
  } else if (otherUsersWithSameName[0]){//if there is only one user with that name, the Gid must be deleted
    let lastUserId = otherUsersWithSameName[0]._id;
    let lastUserFirst_Name = otherUsersWithSameName[0].First_Name;
    let lastUserFamily_Name = otherUsersWithSameName[0].Family_Name;
    let lastUserFormal_Name = lastUserFamily_Name + " " + lastUserFirst_Name;
    db.collection("users").updateOne(
      { _id: lastUserId },
      {
        $set: {
          Formal_Name: lastUserFormal_Name,
        },
      }
    );
    return res.redirect("/admin-delete-user");
  } else {
    return res.redirect("/admin-delete-user");
  }
});

let allIDs = [];
app.get("/admin-edit-user", isAuth, async (req, res) => {
  
  //this part is for selecting only the inferior nodes
  let currentUserEmail =  req.session.userEmail;
  let currentUser = await UsersList.findOne({
    email_angajat: currentUserEmail
  });
  //this function will store the IDs of the inferior nodes in an array which we will use later
  async function parseTree(userId){
    let user = await UsersList.findOne({
      _id: userId
    }).populate({
      path: "supervising",
    });
    let numberOfSupervisedUsers =  user.supervising.length;
    if (numberOfSupervisedUsers == 0){ 
      return;
    }
    // console.log(numberOfSupervisedUsers);
    for( let i = 0; i < numberOfSupervisedUsers ; i++ ){
      // console.log(user.supervising[i]._id);
      allIDs.push(user.supervising[i]._id);
      await parseTree(user.supervising[i]._id);
    }
  }
  await parseTree(currentUser._id);
  // console.log(allIDs);
  let users = await UsersList.find({
    '_id':{
      $in: allIDs
    }
  });
  allIDs = []; //resetting the value of the global variable "allIDs"



  const usersList = await UsersList.find({});
  // pastram in supervisoriFinal toti supervisorii aparand o singura data
  let supervisori = [];
  let i = 0;
  let usersCounter = await UsersList.find({}).countDocuments();
  for (let j = 0; j < usersCounter; j++) {
    let decoy = supervisori.push(`${usersList[j].Supervisor}`);
  }
  let supervisoriFinal = [];
  for (let sup in supervisori) {
    let ok = 0;
    for (let j in supervisoriFinal) {
      if (supervisori[sup] == supervisoriFinal[j]) {
        ok = 1;
        break;
      }
    }
    if (ok == 0) {
      let decoy = supervisoriFinal.push(`${supervisori[sup]}`);
    }
  }
  res.render("admin-edit-user", {
    usersLists: users,
    supervisori: supervisoriFinal,
  });
});

app.post("/admin-edit-user", isAuth, async (req, res) => {
  let Formal_Name = req.body.Formal_Name;
  let Old_Formal_Name = Formal_Name; //pastram vechiul Formal_Name
  let user2 = await UsersList.findOne({
    Formal_Name: Formal_Name,
  }).populate({
    path: "supervising",
  });
  let gid = user2.Gid;
  let userId = user2._id; // pastram id-ul celui ce avea Formal_Name inainte sa se schimbe

  let firstName = req.body.firstName;
  let familyName = req.body.familyName;
  firstName = firstName.replace(/\s+/g, " ");
  familyName = familyName.replace(/\s+/g, " ");
  if(firstName.indexOf("-")!=-1){
    firstName = firstName.replace(/ /g,''); //eliminates white spaces
  }

  Formal_Name = "";
  if (familyName[familyName.length - 1] == " ") {
    Formal_Name = familyName + firstName;
  } else {
    Formal_Name = familyName + " " + firstName;
  }
  let auxiliar = capitalizeTheFirstLetterOfEachWord(Formal_Name);
  Formal_Name = auxiliar;
  auxiliar = capitalizeTheFirstLetterOfEachWord(firstName);
  firstName = auxiliar;
  auxiliar = capitalizeTheFirstLetterOfEachWord(familyName);
  familyName = auxiliar;
  if(Formal_Name[Formal_Name.length - 1] == " "){
    Formal_Name = Formal_Name.substring(0, Formal_Name.length - 1);//se elimina spatiul de la finalul stringului
  }
  if(firstName[firstName.length - 1] == " "){
    firstName = firstName.substring(0, firstName.length - 1);
  }
  if(familyName[familyName.length - 1] == " "){
    familyName = familyName.substring(0, familyName.length - 1);
  }
  let Formal_Name2 = Formal_Name; //we will use Formal_Name2 later on for checking if there still are other users with this exact name

  // let user = await UsersList.findOne({
  //   Formal_Name: Formal_Name
  // });
  // if (user && (Formal_Name != Old_Formal_Name)) {
  //   // console.log("this user already exists");
  //   req.session.error = "User already exists";
  //   req.flash("error", "A user with this name already exists :/");
  //   return res.redirect("/admin-edit-user");
  // }


  //checking if the new name is not a part of the old name
  //ex: John Doe is also a part of John Doedoe
  //thus we must consider this case
  db.collection("users").updateOne(//firstly we will assign the new Formal_Name and after we will check if adding the Gid is necessary
    { _id: userId },
    {
      $set: {
        Formal_Name: Formal_Name,
      },
    }
  );


  //checking if there are other users with the same name in the database 
  let regex = new RegExp(Formal_Name, "i");
  let Formal_Name_Copy = Formal_Name;
  let otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}}); //regex was used so we can match UserName with UserName Gid
  if(otherUsersWithSameName[1]){ //if there are other users with the same name, we must concatenate the Gid
    Formal_Name = Formal_Name + " " + gid;
    let usersCounter = await UsersList.find({Formal_Name: { $regex: regex}}).countDocuments();
    for( let i = 0; i < usersCounter; i++ ){//updating all users' Formal_Name (addint their Gid in the Formal_Name)
      let otherUserFirst_Name = otherUsersWithSameName[i].First_Name;
      let otherUserFamily_Name = otherUsersWithSameName[i].Family_Name;
      let otherUserGid = otherUsersWithSameName[i].Gid;
      let otherUserFormal_Name = otherUserFamily_Name + " " + otherUserFirst_Name + " " + otherUserGid;
      let otherUserId = otherUsersWithSameName[i]._id;
      db.collection("users").updateOne(
        { _id: otherUserId },
        {
          $set: {
            Formal_Name: otherUserFormal_Name,
          },
        }
      );
    }
  }

  //if the user changed their name, we must edit the "supervisor" field of every user that is being supervised by them
  // regex = new RegExp(Formal_Name_Copy, "i");
  // otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}});
  for( let j = 0 ; j < user2.supervising.length ; j++ ){
    db.collection("users").updateOne(
      { _id: user2.supervising[j]._id },
      {
        $set: {
          Supervisor: Formal_Name,
        },
      }
    );
  }


  let email_angajat = req.body.email_angajat;
  let Supervisor = req.body.Supervisor;
  let email_superior = req.body.email_superior;
  let restrictions = req.body.Restrictions;
  let Last_MM = req.body.Last_MM;
  
  let Next_MM = new Date(Last_MM);
  let Next_MM_String;
  Next_MM.setFullYear(Next_MM.getFullYear()+1);
  Next_MM_String = Next_MM.getFullYear() + '-' + ('0' + (Next_MM.getMonth()+1)).slice(-2) + '-' + ('0' + Next_MM.getDate()).slice(-2);

  let real_last_mm = reverseDateToDate(Last_MM);
  let real_next_mm = reverseDateToDate(Next_MM_String);


  // UNCOMMENT THIS FOR PRODUCTION
  // ❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
  // if (!email_angajat.includes("vitesco")){
  //   req.session.error = "Invalid email";
  //   req.flash("error", "The email address is invalid. It must contain @vitesco.com");
  //   return res.redirect("/admin-edit-user");
  // }
  // ❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
  // UNCOMMENT THIS FOR PRODUCTION


  if(user2.Supervisor != Supervisor){ //verificam daca se doreste schimbarea superviser-ului
    // console.log("se doreste schimbarea superviser-ului");
    if((Supervisor == "-") || (Supervisor == "")){
      // console.log("userul nu va avea niciun superior");
      let oldSupervisor = await UsersList.findOne({
        email_angajat: user2.email_superior,
      }).populate({
        path: "supervising",
      });
      // console.log(oldSupervisor);
      for( let j = 0 ; j < oldSupervisor.supervising.length ; j++ ){
        //trebuie folosit stringify pentru ca JS nu poate compara doua obiecte
        if(JSON.stringify(oldSupervisor.supervising[j]._id) === JSON.stringify(user2._id)){
          oldSupervisor.supervising.splice(j,1);
          await oldSupervisor.save();
        }
      }
    }
    else 
    {
      // console.log("userul va avea un superior");
      if( (user2.email_superior == "-") || (user2.email_superior == "")){
        //daca userul nu avea superior inainte, dam direct push fara splice
        let newSupervisor = await UsersList.findOne({
          email_angajat: email_superior,
        }).populate({
          path: "supervising",
        });
        newSupervisor.supervising.push(user2._id);
        await newSupervisor.save();
      } 
      else 
      {
      //prima data mergem la vechiul superviser si dam splice la id
      let oldSupervisor = await UsersList.findOne({
        email_angajat: user2.email_superior,
      }).populate({
        path: "supervising",
      });
      // console.log(oldSupervisor);
      for( let j = 0 ; j < oldSupervisor.supervising.length ; j++ ){
        //trebuie folosit stringify pentru ca JS nu poate compara doua obiecte
        if(JSON.stringify(oldSupervisor.supervising[j]._id) === JSON.stringify(user2._id)){
          oldSupervisor.supervising.splice(j,1);
          await oldSupervisor.save();
        }
      }
      //acum ca am taiat id-ul userului ce vrea sa fie editat din array-ul superiorului lui, vom merge la noul superior si vom da push cu id-ul userului
      let newSupervisor = await UsersList.findOne({
        email_angajat: email_superior,
      }).populate({
        path: "supervising",
      });
      newSupervisor.supervising.push(user2._id);
      await newSupervisor.save();
    }
    }
  } else {
    // console.log("nu se doreste schimbarea superviser-ului");
  }


  if (user2) {
    db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          email_angajat: email_angajat,
          First_Name: firstName,
          Family_Name: familyName,
          Supervisor: Supervisor,
          email_superior: email_superior,
          Medical_limitations: restrictions,
          Last_MM: real_last_mm,
          Next_MM: real_next_mm,
          Formal_Name: Formal_Name,
        },
      }
    );
  }
  if(Old_Formal_Name != Formal_Name){ //daca am schimbat numele angajatului, abia atunci sa updateze numele si in intervale
    let Old_Name_Intervals = await Interval.find({
      Name: Old_Formal_Name,
    });
    for(let i = 0; i < Old_Name_Intervals.length; i++){
      db.collection("intervals").updateOne(
        { _id: Old_Name_Intervals[i]._id },
        {
          $set: {
            Name: Formal_Name
          },
        }
      );
    }
  }

  // console.log("am updatat numele din intervale");
  // console.log("----------------");

   //after editing the user we will update the other users' Formal_Name (if it is the case)
   Formal_Name = Old_Formal_Name;
   regex = new RegExp(Formal_Name, "i");
   otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}}); //regex was used so we can match UserName with UserName Gid
   if(otherUsersWithSameName[1]){//if there are at least two users with the same name, we keep the gid in the name
     return res.redirect("/admin-edit-user"); //no changes are needed
   } else if (otherUsersWithSameName[0]){//if there is only one user with that name, the Gid must be deleted
     let lastUserId = otherUsersWithSameName[0]._id;
     let lastUserFirst_Name = otherUsersWithSameName[0].First_Name;
     let lastUserFamily_Name = otherUsersWithSameName[0].Family_Name;
     let lastUserFormal_Name = lastUserFamily_Name + " " + lastUserFirst_Name;
     db.collection("users").updateOne(
       { _id: lastUserId },
       {
         $set: {
           Formal_Name: lastUserFormal_Name,
         },
       }
     );
     return res.redirect("/admin-edit-user");
   } else {
     return res.redirect("/admin-edit-user");
   }

});

app.get("/admin-appointments-overview", isAuth, async (req, res) => {
  //sorting the appointments chronologically

  // let appointments = await Appointments.find({ Expired: false }).populate({
  //   path: "intervals",
  // });
  let appointments = await Appointments.find({}).populate({
    path: "intervals",
  });
  let pivotCounter = 0;
  // let appointmentsCount = await Appointments.find({
  //   Expired: false,
  // }).countDocuments();
  let appointmentsCount = await Appointments.find({}).countDocuments();
  while (pivotCounter < appointmentsCount - 1) {
    let ok = true; // consideram ca pivotul e chiar minimul din sir
    let min = pivotCounter;
    for (let i = pivotCounter; i < appointmentsCount; i++) {
      if (appointments[min].Date > appointments[i].Date) {
        min = i;
        ok = false;
      }
    }
    if (ok === false) {
      [appointments[pivotCounter], appointments[min]] = [
        appointments[min],
        appointments[pivotCounter],
      ];
    }
    pivotCounter++;
  }
  res.render("admin-appointments-overview", {
    appointments: appointments,
  });
});

app.post("/export-appointments-table", async (req, res) => {
  // res.status(200)
  //       .attachment("name.txt")
  //       .send('This is the content')
  let startDate = req.body.appStart;
  let endDate = req.body.appEnd;
  console.log(startDate);
  console.log(endDate);

  let usersLists = await Interval.aggregate([
    {
      $match: {
        Starting_Hour: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).getTime() + 60 * 60 * 24 * 1000),
        },
      },
    },
    {
      $project: {
        _id: 0,
        Name: 1,
        Date: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$Starting_Hour",
          },
        },
        Starting_Hour: {
          $dateToString: {
            format: "%H:%M",
            date: "$Starting_Hour",
          },
        },
        Ending_Hour: {
          $dateToString: {
            format: "%H:%M",
            date: "$Ending_Hour",
          },
        },
      },
    },
  ]);

  var model = mongoXlsx.buildDynamicModel(usersLists);
  /* Generate Excel */
  mongoXlsx.mongoData2Xlsx(
    usersLists,
    model,
    { fileName: "tabel-MM.xlsx" },
    function (err, usersLists) {
      console.log("File saved at:", usersLists.fullPath);
      res.download(usersLists.fullPath);
      setTimeout(function () {
        try {
          fs.unlinkSync(usersLists.fullPath);
        } catch (e) {
          console.log("this is a good error");
        }
      }, 1000);
    }
  );
});

app.post("/admin-appointments-overview", async (req, res) => {
  let email_angajat = req.body.email_angajat;
  let Formal_Name = req.body.Formal_Name;
  UsersList.findOne({ email_angajat: email_angajat }, function (error, person) {
    console.log("This object will get deleted " + person);
    person.remove();
  });
  return res.redirect("/admin-appointments-overview");
});

app.get("/admin-configure-mm-check", isAuth, async (req, res) => {
  //sorting the appointments chronologically
  let appointments = await Appointments.find({ Expired: false }).populate({
    path: "intervals",
  });
  let pivotCounter = 0;
  let appointmentsCount = await Appointments.find({
    Expired: false,
  }).countDocuments();
  while (pivotCounter < appointmentsCount - 1) {
    let ok = true; // consideram ca pivotul e chiar minimul din sir
    let min = pivotCounter;
    for (let i = pivotCounter; i < appointmentsCount; i++) {
      if (appointments[min].Date > appointments[i].Date) {
        min = i;
        ok = false;
      }
    }
    if (ok === false) {
      [appointments[pivotCounter], appointments[min]] = [
        appointments[min],
        appointments[pivotCounter],
      ];
    }
    pivotCounter++;
  }
  res.render("admin-configure-mm-check", {
    appointments: appointments,
  });
});

app.post("/admin-add-appointment-day", async (req, res) => {
  let addDate = req.body.addDate;
  let addStartingHour = req.body.addStartingHour;
  let addEndingHour = req.body.addEndingHour;

  if(addStartingHour[4]!=0 || addEndingHour[4]!=0){
    req.flash("error", "The minutes of the new interval must be a multiple of 10. (00, 10, 20, 30, 40, 50)");
    console.log("teoretic trebuia afisat mesajul");
    return res.redirect("/admin-configure-mm-check");
  }

  let year = addDate[0] + addDate[1] + addDate[2] + addDate[3];
  let month = addDate[5] + addDate[6];
  month = month - 1;
  let day = addDate[8] + addDate[9];
  let d = new Date(year, month, day);
  console.log("--> " + d);

  let hour = addStartingHour[0] + addStartingHour[1];
  let minute = addStartingHour[3] + addStartingHour[4];
  let s = new Date(year, month, day, hour, minute);
  console.log("--> " + s);

  let hour2 = addEndingHour[0] + addEndingHour[1];
  let minute2 = addEndingHour[3] + addEndingHour[4];
  let e = new Date(year, month, day, hour2, minute2);
  console.log("--> " + e);

  function changeTimezone(date, ianatz) {
    var invdate = new Date(
      date.toLocaleString("en-US", {
        timeZone: ianatz,
      })
    );
    var diff = date.getTime() - invdate.getTime();
    return new Date(date.getTime() + diff);
  }

  let finalDate = changeTimezone(d, "UTC");
  let finalStartingHour = changeTimezone(s, "UTC");
  let finalEndingHour = changeTimezone(e, "UTC");

  let todayDate = new Date();
  let expired = false;
  if (todayDate > finalDate) {
    expired = true;
  }

  let apps = await Appointments.find({ Date: finalDate }); // sa verific daca nu exista deja pentru ziua respectiva
  if (apps != "") {
    console.log("ne pare rau insa ziua aceasta exista deja");
  } else {
    const newAppointment = new Appointments({
      Date: finalDate,
      Starting_Hour: finalStartingHour,
      Ending_Hour: finalEndingHour,
      Expired: expired,
    });
    newAppointment.save();
  }
  return res.redirect("/admin-configure-mm-check");
});

app.post("/admin-delete-appointment-day", async (req, res) => {
  let deleteDate = req.body.deleteAppointment;
  console.log(deleteDate);
  let apps = await Appointments.find({ Date: deleteDate }).populate({
    path: "intervals",
  });
  if (apps == "") {
    console.log("ne pare rau insa ziua nu exista");
  } else {
    //intai stergem intervalele (programarile facute de oameni)
    let k = 0;
    while (1 < 2) {
      if (apps[0].intervals[k]) {
        // console.log(apps[0].intervals[k]._id);
        console.log("an interval will be deleted");
        await Interval.findOne(
          { _id: apps[0].intervals[k]._id },
          async function (error, interval) {
            let user = await UsersList.findOne({ Formal_Name: interval.Name });
            sendDeletedAppointmentEmail(user.email_angajat);
            interval.remove();
          }
        );
        k++;
      } else {
        break;
      }
    }
    //acum stergem ziua propriu-zis
    await Appointments.findOne(
      { Date: deleteDate },
      function (error, appointment) {
        console.log("An appointment will get deleted");
        appointment.remove();
      }
    );
  }
  return res.redirect("/admin-configure-mm-check");
});

app.get("/get-users-interval", isAuth, async (req, res) => {
  const {interval} = req.query;
  // console.log(interval);
  const tomorrow = new Date(interval);

  // Add 1 Day
  tomorrow.setDate(tomorrow.getDate() + 1);
  // console.log(tomorrow);

  let intervals = await Interval.find({Starting_Hour: {
    "$gte" : interval, 
    "$lt" : tomorrow 
    }
  });
  // console.log(intervals);
  res.send(intervals);

});

app.get("/get-users-interval-edit", isAuth, async (req, res) => {
  // const { searchUser, searchTeamLeader, searchAdmin, searchMedic } = req.query;
  function changeTimezone(date, ianatz) {
    var invdate = new Date(
      date.toLocaleString("en-US", {
        timeZone: ianatz,
      })
    );
    var diff = date.getTime() - invdate.getTime();
    return new Date(date.getTime() + diff);
  }
  console.log("------");
  const {interval} = req.query;
  console.log(interval); //contine tot query-ul
  // 2021-11-26T00:00:00.000Z?newStartingHour=?newEndingHour=

  var theDate = new Date (interval.split('?')[0]); //aici avem doar data
  console.log(theDate);
  const tomorrow = new Date(theDate);

  // Add 1 Day
  tomorrow.setDate(tomorrow.getDate() + 1);
  console.log(tomorrow);
  
  let indexOfFirstEq = interval.indexOf("=");
  let indexOfSecondEq = interval.indexOf("=", (indexOfFirstEq + 1));
  // console.log(indexOfFirstEq);
  // console.log(indexOfSecondEq);
  let indexOfFirstQuestionMark = interval.indexOf("?");
  let indexOfSecondQuestionMark = interval.indexOf("?", (indexOfFirstQuestionMark + 1));
  // console.log(indexOfFirstQuestionMark);
  // console.log(indexOfSecondQuestionMark);
  let primaOra = interval.substring(indexOfFirstEq+1, indexOfSecondQuestionMark);
  let aDouaOra = interval.substring(indexOfSecondEq+1);
  if(primaOra=="" || aDouaOra==""){
    console.log("lipseste minim un capat de interval");
    res.send("");
  } else {
  console.log(primaOra);
  console.log(aDouaOra);
  let startingPoint = new Date(theDate);
  let endingPoint = new Date(theDate);
  let h1 = primaOra[0]+primaOra[1];
  let m1 = primaOra[3]+primaOra[4];
  let h2 = aDouaOra[0]+aDouaOra[1];
  let m2 = aDouaOra[3]+aDouaOra[4];
  startingPoint.setHours(h1, m1);
  endingPoint.setHours(h2, m2);
  startingPoint = changeTimezone(startingPoint, "UTC");
  endingPoint = changeTimezone(endingPoint, "UTC");
  console.log(startingPoint);
  console.log(endingPoint);
  console.log("------");
  let intervals = await Interval.find().or([{ Starting_Hour: {
      "$gte" : theDate, 
      "$lt" : startingPoint 
      } }, { Starting_Hour: {
        "$gte" : endingPoint, 
        "$lt" : tomorrow 
        } }]);
  // console.log(intervals);
  res.send(intervals);
      }
});

// let allIDs = [];
app.get("/admin-test", isAuth, async (req, res) => {
  
  res.render("admin-test", {
    // usersLists: users,
  });
});

app.post("/admin-test", async (req, res) => {
  
  return res.redirect("/medical-check");
});

{
  // app.post("/admin-edit-appointment-day", async (req,res) => {
  //   let date = req.body.editAppointment;
  //   let apps = await Appointments.find({ Date: date }).populate({
  //     path: "intervals"
  //   });
  //   if (apps == ""){
  //     console.log("ne pare rau insa ziua nu exista");
  //   } else{
  //     //intai stergem intervalele (programarile facute de oameni)
  //     let k = 0;
  //     while(1<2){
  //       if(apps[0].intervals[k]){
  //       // console.log(apps[0].intervals[k]._id);
  //       console.log("an interval will be deleted");
  //       await Interval.findOne({ _id: apps[0].intervals[k]._id}, function (error, interval){
  //         interval.remove();
  //       });
  //       k++;
  //       } else {
  //         break;
  //       }
  //     }
  //     //acum stergem ziua propriu-zis
  //     await Appointments.findOne({Date: date}, function (error, appointment){
  //       console.log("An appointment will get deleted");
  //       appointment.remove();
  //     });
  //   }
  //   let addDate = date;
  //   let addStartingHour = req.body.editStartingHour;
  //   let addEndingHour = req.body.editEndingHour;
  //   let year = addDate[0]+addDate[1]+addDate[2]+addDate[3];
  //   let month = addDate[5]+addDate[6];
  //   month = month - 1;
  //   let day = addDate[8]+addDate[9];
  //   let d = new Date(year, month, day);
  //   console.log("--> " + d);
  //   let hour = addStartingHour[0]+addStartingHour[1];
  //   let minute = addStartingHour[3]+addStartingHour[4];
  //   let s = new Date(year,month,day,hour,minute);
  //   console.log("--> " + s);
  //   let hour2 = addEndingHour[0]+addEndingHour[1];
  //   let minute2 = addEndingHour[3]+addEndingHour[4];
  //   let e = new Date(year,month,day,hour2,minute2);
  //   console.log("--> " + e);
  //   function changeTimezone(date, ianatz) {
  //     var invdate = new Date(date.toLocaleString('en-US', {
  //       timeZone: ianatz
  //     }));
  //     var diff = date.getTime() - invdate.getTime();
  //     return new Date(date.getTime() + diff);
  //   }
  //   let finalDate = changeTimezone(d, "UTC");
  //   let finalStartingHour = changeTimezone(s, "UTC");
  //   let finalEndingHour = changeTimezone(e, "UTC");
  //   let todayDate = new Date();
  //   let expired = false;
  //   if(todayDate>finalDate){
  //     expired = true;
  //   }
  //   let apps2 = await Appointments.find({ Date: finalDate }); // sa verific daca nu exista deja pentru ziua respectiva
  //   if (apps2 != ""){
  //     console.log("ne pare rau insa ziua aceasta exista deja");
  //   } else{
  //   const newAppointment = await new Appointments({
  //     Date: finalDate,
  //     Starting_Hour: finalStartingHour,
  //     Ending_Hour: finalEndingHour,
  //     Expired: expired
  //     });
  //     await newAppointment.save();
  //   }
  //   return res.redirect("/admin-configure-mm-check");
  // });
}

app.post("/admin-edit-appointment-day2", async (req, res) => {
  let date = req.body.editAppointment;
  let addDate = date;
  let addStartingHour = req.body.editStartingHour;
  let addEndingHour = req.body.editEndingHour;

  if(addStartingHour[4]!=0 || addEndingHour[4]!=0){
    req.flash("error", "The minutes of the new interval must be a multiple of 10. (00, 10, 20, 30, 40, 50)");
    console.log("teoretic trebuia afisat mesajul");
    return res.redirect("/admin-configure-mm-check");
  }

  let year = addDate[0] + addDate[1] + addDate[2] + addDate[3];
  let month = addDate[5] + addDate[6];
  month = month - 1;
  let day = addDate[8] + addDate[9];
  let d = new Date(year, month, day);

  let hour = addStartingHour[0] + addStartingHour[1];
  let minute = addStartingHour[3] + addStartingHour[4];
  let s = new Date(year, month, day, hour, minute);

  let hour2 = addEndingHour[0] + addEndingHour[1];
  let minute2 = addEndingHour[3] + addEndingHour[4];
  let e = new Date(year, month, day, hour2, minute2);

  function changeTimezone(date, ianatz) {
    var invdate = new Date(
      date.toLocaleString("en-US", {
        timeZone: ianatz,
      })
    );
    var diff = date.getTime() - invdate.getTime();
    return new Date(date.getTime() + diff);
  }

  let finalDate = changeTimezone(d, "UTC");
  let finalStartingHour = changeTimezone(s, "UTC");
  let finalEndingHour = changeTimezone(e, "UTC");

  let theNewEditedAppointment = await Appointments.find({
    Date: date,
  }).populate({
    path: "intervals",
  });
  if (theNewEditedAppointment) {
    let mm_id = theNewEditedAppointment[0]._id;
    console.log("se va updata o ora");
    db.collection("appointments").updateOne(
      { _id: mm_id },
      {
        $set: {
          Starting_Hour: finalStartingHour,
          Ending_Hour: finalEndingHour,
        },
      }
    );
  }
  let unu = "";
  let doi = "";
  let k = 0;
  while (1 < 2) {
    if (theNewEditedAppointment[0].intervals[k]) {
      await Interval.findOne(
        { _id: theNewEditedAppointment[0].intervals[k]._id },
        async function (error, interval) {
          unu = changeTimezone(interval.Starting_Hour, "UTC");
          doi = changeTimezone(interval.Ending_Hour, "UTC");
          if (unu < finalStartingHour || doi > finalEndingHour) {
            let user = await UsersList.findOne({ Formal_Name: interval.Name });
            sendDeletedAppointmentEmail(user.email_angajat);
            interval.remove();
          }
        }
      );
      k++;
    } else {
      break;
    }
  }
  return res.redirect("/admin-configure-mm-check");
});

function sendDeletedAppointmentEmail(sendTo) {
  console.log("The email function has been reached !!");
  const transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
      user: "razvaniftimoaia20@yahoo.ro",
      pass: "_email_password_here_",
    },
  });
  const options = {
    from: "razvaniftimoaia20@yahoo.ro",
    to: sendTo,
    subject: "Programarea pentru medicina muncii a fost anulata",
    text: "Buna ziua, cu parere de rau va informam ca programarea dumneavoastra pentru controlul medical a fost stearsa datorita modificarii intervalului / anularii zilei pentru control. Va multumim pentru intelegere si va asteptam sa faceti o noua programare!",
  };
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("sent:" + info.response);
    console.log("The email was sent successfully !!");
  });
}

app.get("/admin-MM-email", isAuth, async (req, res) => {
  let medicalCheck = await MM.findOne({ variable: 1 });
  let mmDay = "MON";
  let mmText = "Medicina muncii va expira curand";
  let mmHour = "8";
  if (medicalCheck) {
    mmDay = medicalCheck.emailDay;
    mmText = medicalCheck.emailMessage;
    mmHour = medicalCheck.emailHour;
  }
  res.render("admin-MM-email", {
    mmDays: mmDay,
    mmTexts: mmText,
    mmHours: mmHour
  });
});

app.post("/admin-MM-email", async (req, res) => {
  let dayy = req.body.weekDay;
  let emailText = req.body.emailMessage;
  let day = dayy.substring(0, 3).toUpperCase();
  auxVariable = "1";
  let hour = req.body.hour;
  console.log(hour);
  if (hour == ""){
    console.log("nu s-a ales o ora");
    hour = "08:00";
  }

  let medicalCheck = await MM.findOne({ variable: 1 });
  if (medicalCheck) {
    let mm_id = medicalCheck._id;
    db.collection("mms").updateOne(
      { _id: mm_id },
      {
        $set: {
          emailMessage: emailText,
          emailDay: day,
          emailHour: hour,
        },
      }
    );
  } else {
    const newMessage = new MM({
      emailMessage: emailText,
      emailDay: day,
      emailHour: hour,
      variable: 1,
    });
    newMessage.save();
  }

  return res.redirect("/dashboard");
});

app.get("/admin-send-email-MM-company", isAuth, async (req, res) => {
  let medicalCheck = await MMCompanyEmail.findOne({ variable: "1" });
  let mmDay = "1";
  let mmEmail = "";
  let mmSubject = "Lista cu cei programati";
  let mmText = "";
  if (medicalCheck) {
    mmDay = medicalCheck.workdaysBeforeEmail;
    mmEmail = medicalCheck.emailTo;
    mmSubject = medicalCheck.emailSubject;
    mmText = medicalCheck.emailMessage;
  }

  function changeTimezone(date, ianatz) {
    var invdate = new Date(
      date.toLocaleString("en-US", {
        timeZone: ianatz,
      })
    );
    var diff = date.getTime() - invdate.getTime();
    return new Date(date.getTime() + diff);
  }
  let currentDate = changeTimezone(new Date(2021, 10, 12, 08, 00, 00), "UTC");
  let futureDate = changeTimezone(new Date(2021, 10, 13, 00, 00, 00), "UTC");
  if (
    new Date(
      currentDate.getTime() +
        16 * 60 * 60 * 1000 +
        (mmDay - 1) * (24 * 60 * 60 * 1000)
    ).getTime() == futureDate.getTime()
  ) {
    console.log("functia merge bine");
  } else {
    console.log("funtia nu merge bine");
  }

  res.render("admin-send-email-MM-company", {
    day: mmDay,
    email: mmEmail,
    subject: mmSubject,
    text: mmText,
  });
});

app.post("/admin-send-email-MM-company", async (req, res) => {
  let email = req.body.email_companie;
  let message = req.body.email_message;
  let subject = req.body.email_subject;
  let day = req.body.email_day; //the number of days before the medical check
  let medicalCheck = await MMCompanyEmail.findOne({ variable: "1" });
  if (medicalCheck) {
    let mm_id = medicalCheck._id;
    db.collection("mmcompanyemails").updateOne(
      { _id: mm_id },
      {
        $set: {
          emailMessage: message,
          workdaysBeforeEmail: day,
          emailTo: email,
          emailSubject: subject,
          variable: "1",
        },
      }
    );
  } else {
    const newEmail = new MMCompanyEmail({
      emailMessage: message,
      workdaysBeforeEmail: day,
      emailTo: email,
      emailSubject: subject,
      variable: "1",
    });
    newEmail.save();
  }
  // await chooseEmailParticipants();
  return res.redirect("/admin-send-email-MM-company");
});

// async function sendEmailToMM(){
//   let auxMMDay = await MMCompanyEmail.findOne({ variable: "1" });
//   let timeStar = "WED";
//   let auxTimeStar = auxMMDay.emailDay;
//   if (auxTimeStar) {
//     timeStar = auxTimeStar;
//   }
//   schedule.scheduleJob(`0 8 * * ${timeStar}`, async () => {
//     await chooseEmailParticipants();
//   });
// };
// sendEmailToMM();

schedule.scheduleJob(`0 8 * * *`, async () => { //performs everyday at 08:00
  chooseEmailParticipants(); //creates the list of people that will be attached to the email that will be sent to the medical company
  checkExpiredAppointmentDays(); //updates the expired appointments. Sets the "expired" field to true if it is the case.
});

async function testare() {}

async function checkExpiredAppointmentDays() { //updates the expired appointments. Sets the "expired" field to true if it is the case.
  let appointmentsCount = await Appointments.find({
    Expired: false,
  }).countDocuments();
  let appointmentDate = await Appointments.find({ Expired: false }).populate({
    path: "intervals",
  });
  var today = new Date();
  for (let i = 0; i < appointmentsCount; i++) {
    if (appointmentDate[i].Date.getTime() < today.getTime()) {
      let dateId = appointmentDate[i]._id;
      db.collection("appointments").updateOne(
        { _id: dateId },
        {
          $set: {
            Expired: true,
          },
        }
      );
    }
  }
}

async function chooseEmailParticipants() {
  // ❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
  //verificam intai daca avem programare saptamana asta

  //   function isDateInThisWeek(date) {
  //   const todayObj = new Date();
  //   todayObj.setFullYear(2021,9,2); //asta va trebui stearsa la un moment dat
  //   const todayDate = todayObj.getDate();
  //   const todayDay = todayObj.getDay();
  //   // get first date of week
  //   const firstDayOfWeek = new Date(todayObj.setDate(todayDate - todayDay));
  //   // get last date of week
  //   const lastDayOfWeek = new Date(firstDayOfWeek);
  //   lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
  //   // if date is equal or within the first and last dates of the week
  //   return date >= firstDayOfWeek && date <= lastDayOfWeek;
  // }

  let auxMMDay = await MMCompanyEmail.findOne({ variable: "1" });
  if (auxMMDay) {
    let appointmentsCount = await Appointments.find({
      Expired: false,
    }).countDocuments();
    let appointmentDate = await Appointments.find({ Expired: false }).populate({
      path: "intervals",
    });

    function changeTimezone(date, ianatz) {
      var invdate = new Date(
        date.toLocaleString("en-US", {
          timeZone: ianatz,
        })
      );
      var diff = date.getTime() - invdate.getTime();
      return new Date(date.getTime() + diff);
    }
    let todaysDate = changeTimezone(new Date(), "UTC");
    todaysDate.setHours(08, 0, 0);

    let weekDay = todaysDate.getDay();
    let mmDay = auxMMDay.workdaysBeforeEmail;
    let actualNumberOfDays = 0;
    while (mmDay > 0) {
      if (weekDay != 0 && weekDay != 6) {
        actualNumberOfDays++;
        weekDay++;
        mmDay--;
      } else {
        actualNumberOfDays++;
        if (weekDay == 6) {
          weekDay = 0;
        } else {
          weekDay++;
        }
      }
    }
    mmDay = actualNumberOfDays;

    for (let k = 0; k < appointmentsCount; k++) {
      if (
        new Date(
          todaysDate.getTime() +
            16 * 60 * 60 * 1000 +
            (mmDay - 1) * (24 * 60 * 60 * 1000)
        ).getTime() == appointmentDate[k].Date.getTime()
      ) {
        // if((isDateInThisWeek(appointmentDate[k].Date)==true) && (appointmentDate[k].Date.getDay() == 5))
        // if ( (new Date(currentDate.getTime() + (16*60*60*1000) + ((mmDay - 1)*(24*60*60*1000)))).getTime()  == futureDate.getTime())
        console.log(appointmentDate[k].Date); // daca conditia e indeplinita atunci se trimit mailurile
        let namelist = appointmentDate[k].intervals;

        let listOfNames = [];
        let appointmentDay = [];
        let listOfIntervals = [];
        for (let val of appointmentDate[k].intervals) {
          let decoy = listOfNames.push(`${val.Name}`);
          let decoy2 = appointmentDay.push(
            reverseMMDateToDate(`${val.Starting_Hour}`)
          );
          let decoy3 = listOfIntervals.push(
            getInterval(`${val.Starting_Hour}`)
          );
        }
        //❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
        let auxMMDay = await MMCompanyEmail.findOne({ variable: "1" });
        let MMtextMessage = "";
        if (auxMMDay) {
          MMtextMessage = auxMMDay.emailMessage;
          function countOccurences(string, word) {
            return string.split(word).length - 1;
          }
          let countFN = countOccurences(MMtextMessage, "${nextAppDate}"); // 2
          for (let i = 0; i < countFN; i++) {
            MMtextMessage = MMtextMessage.replace(
              "${name}",
              appointmentDate[k].Date.getTime()
            ); //<- app.date.gettime de verificat
          }
          // console.log(MMtextMessage);

          let emails = auxMMDay.emailTo;
          let individualEmails = emails.split(", ");
          let i = 0;
          while (1 < 2) {
            if (individualEmails[i]) {
              console.log(individualEmails[i]); //functia de dat mail pt fiecare nume
              sendMMEmailToCompany(
                individualEmails[i],
                MMtextMessage,
                auxMMDay.emailSubject,
                listOfNames,
                appointmentDay,
                listOfIntervals
              ); //auxMMDay.emailMessage in loc de MMtextMessage
            } else {
              break;
            }
            i = i + 1;
          }
        }
      }
    }
  }
}

async function sendMMEmailToCompany(
  sendTo,
  sendText,
  sendSubject,
  namelist,
  appointmentDay,
  intervalList
) {
  console.log("The email function has been reached !!");
  const transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
      user: "razvaniftimoaia20@yahoo.ro",
      pass: "_email_password_here_",
    },
  });
  const template = path.join(__dirname, "emails", "MMcompany", "html");
  const email = new Email({
    views: { root: template },
  });
  let locals = {
    formalText: sendText,
    listOfNames: namelist,
    listOfIntervals: intervalList,
  }; //mai trebuie o variabila cu intervalul orar
  const html = await email.render(template, locals);

  const options = {
    from: "razvaniftimoaia20@yahoo.ro",
    to: sendTo,
    subject: sendSubject,
    // text: sendText,
    html,
  };
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("sent:" + info.response);
    console.log("The email was sent successfully !!");
  });
}

app.post("/admin-manual-send-email-MM-company", async (req, res) => {
  let auxMMDay = await MMCompanyEmail.findOne({ variable: "1" });
  if (auxMMDay) {
    let appointmentsCount = await Appointments.find({
      Expired: false,
    }).countDocuments();
    let appointmentDate = await Appointments.find({ Expired: false }).populate({
      path: "intervals",
    });
    let k = 0;
    let closestDate = appointmentDate[0].Date;
    console.log(closestDate);
    console.log("------");
    for (let i = 0; i < appointmentsCount; i++) {
      if (appointmentDate[i].Date.getTime() < closestDate.getTime()) {
        closestDate = appointmentDate[i].Date;
        k = i;
      }
    }
    //acum closestDate are cea mai apropiata data fata de cea curenta

    function changeTimezone(date, ianatz) {
      var invdate = new Date(
        date.toLocaleString("en-US", {
          timeZone: ianatz,
        })
      );
      var diff = date.getTime() - invdate.getTime();
      return new Date(date.getTime() + diff);
    }

    // DE AICI INCEPE PARTEA CARE SE APLICA LA MINE
    let namelist = appointmentDate[k].intervals;
    let listOfNames = [];
    let appointmentDay = [];
    let listOfIntervals = [];
    for (let val of appointmentDate[k].intervals) {
      let decoy = listOfNames.push(`${val.Name}`);
      let decoy2 = appointmentDay.push(
        reverseMMDateToDate(`${val.Starting_Hour}`)
      );
      let decoy3 = listOfIntervals.push(getInterval(`${val.Starting_Hour}`));
    }
    //❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
    let auxMMDay = await MMCompanyEmail.findOne({ variable: "1" });
    let MMtextMessage = "";
    if (auxMMDay) {
      MMtextMessage = auxMMDay.emailMessage;
      function countOccurences(string, word) {
        return string.split(word).length - 1;
      }
      let countFN = countOccurences(MMtextMessage, "${nextAppDate}"); // 2
      for (let i = 0; i < countFN; i++) {
        MMtextMessage = MMtextMessage.replace(
          "${nextAppDate}",
          appointmentDay[0]
        ); //<- app.date.gettime de verificat
      }
      //reverseMMDateToDate(appointmentDate[k].Date)
      // console.log(MMtextMessage);

      let emails = auxMMDay.emailTo;
      let individualEmails = emails.split(", ");
      let i = 0;
      while (1 < 2) {
        if (individualEmails[i]) {
          console.log(individualEmails[i]); //functia de dat mail pt fiecare nume
          sendMMEmailToCompany(
            individualEmails[i],
            MMtextMessage,
            auxMMDay.emailSubject,
            listOfNames,
            appointmentDay,
            listOfIntervals
          ); //auxMMDay.emailMessage in loc de MMtextMessage
        } else {
          break;
        }
        i = i + 1;
      }
    }
  }

  console.log("functia de manual send a fost apelata cu succes!!!");
  return res.redirect("/admin-send-email-MM-company");
});

app.get("/admin-assign-roles", isAuth, async (req, res) => {
  const usersList = await UsersList.find({});
  let basic = [];
  let teamLeader = [];
  let admin = [];
  let medic = [];
  let eshManager = [];
  let basicList = null;
  let teamLeaderList = null;
  let adminList = null;
  let medicList = null;
  let eshManagerList = null;
  let i = 0;
  let usersCounter = await UsersList.find({}).countDocuments();
  const { searchUser, searchTeamLeader, searchAdmin, searchMedic, searchESHManager } = req.query;
  if (searchUser) {
    const regex = new RegExp(searchUser, "i");
    basicList = await UsersList.find({
      Formal_Name: { $regex: regex },
      permission: "basic",
    });
  }
  if (searchTeamLeader) {
    const regex = new RegExp(searchTeamLeader, "i");
    teamLeaderList = await UsersList.find({
      Formal_Name: { $regex: regex },
      permission: "team leader",
    });
  }
  if (searchAdmin) {
    const regex = new RegExp(searchAdmin, "i");
    adminList = await UsersList.find({
      Formal_Name: { $regex: regex },
      permission: "admin",
    });
  }
  if (searchMedic) {
    const regex = new RegExp(searchMedic, "i");
    medicList = await UsersList.find({
      Formal_Name: { $regex: regex },
      permission: "medic",
    });
  }
  if (searchESHManager) {
    const regex = new RegExp(searchMedic, "i");
    eshManagerList = await UsersList.find({
      Formal_Name: { $regex: regex },
      permission: "esh manager",
    });
  }
  for (let j = 0; j < usersCounter; j++) {
    if (usersList[j].permission == "basic") {
      let decoy = basic.push(`${usersList[j].Formal_Name}`);
    } else if (usersList[j].permission == "team leader") {
      let decoy = teamLeader.push(`${usersList[j].Formal_Name}`);
    } else if (usersList[j].permission == "admin") {
      let decoy = admin.push(`${usersList[j].Formal_Name}`);
    } else if (usersList[j].permission == "medic") {
      let decoy = medic.push(`${usersList[j].Formal_Name}`);
    } else if (usersList[j].permission == "esh manager") {
      let decoy = eshManager.push(`${usersList[j].Formal_Name}`);
    }
  }
  if (searchUser) {
    res.render("admin-assign-roles", {
      basics: basicList,
      teamLeaders: teamLeader,
      admins: admin,
      medics: medic,
      eshManagers: eshManager
    });
  } else if (searchTeamLeader) {
    res.render("admin-assign-roles", {
      basics: basic,
      teamLeaders: teamLeaderList,
      admins: admin,
      medics: medic,
      eshManagers: eshManager
    });
  } else if (searchAdmin) {
    res.render("admin-assign-roles", {
      basics: basic,
      teamLeaders: teamLeader,
      admins: adminList,
      medics: medic,
      eshManagers: eshManager
    });
  } else if (searchMedic) {
    res.render("admin-assign-roles", {
      basics: basic,
      teamLeaders: teamLeader,
      admins: admin,
      medics: medicList,
      eshManagers: eshManager
    });
  } else if (searchESHManager) {
    res.render("admin-assign-roles", {
      basics: basic,
      teamLeaders: teamLeader,
      admins: admin,
      medics: medic,
      eshManagers: eshManagerList
    });
  } else {
    res.render("admin-assign-roles", {
      basics: basic,
      teamLeaders: teamLeader,
      admins: admin,
      medics: medic,
      eshManagers: eshManager
    });
  }
});

app.post("/admin-assign-roles", async (req, res) => {
  let name = req.body.Name;
  let role = req.body.Role;

  db.collection("users").updateOne(
    { Formal_Name: name },
    {
      $set: {
        permission: role,
      },
    }
  );

  const user = await UsersList.findOne({ Formal_Name: name });
  let email = user.email_angajat;
  console.log(email);
  db.collection("mySessions").updateOne(
    { "session.userEmail": email },
    {
      $set: {
        "session.role": role,
      },
    }
  );
  return res.redirect("/admin-assign-roles");
});

app.get("/admin-rights-to-roles", isAuth, async (req, res) => {
  let roles = await Roles.find({});
  res.render("admin-rights-to-roles", {
    role: roles,
  });
});

app.post("/admin-rights-to-roles", async (req, res) => {
  let user_medical_check_three_dots_popup =
    req.body.user_medical_check_three_dots_popup || "0";
  let teamLeader_medical_check_three_dots_popup =
    req.body.teamLeader_medical_check_three_dots_popup || "0";
  let admin_medical_check_three_dots_popup =
    req.body.admin_medical_check_three_dots_popup || "0";
  let medic_medical_check_three_dots_popup =
    req.body.medic_medical_check_three_dots_popup || "0";
  let eshManager_medical_check_three_dots_popup =
    req.body.eshManager_medical_check_three_dots_popup || "0";
  console.log(
    user_medical_check_three_dots_popup,
    teamLeader_medical_check_three_dots_popup,
    admin_medical_check_three_dots_popup,
    medic_medical_check_three_dots_popup,
    eshManager_medical_check_three_dots_popup
  );
  db.collection("roles").updateOne(
    { role: "basic" },
    {
      $set: {
        medical_check_three_dots_popup: user_medical_check_three_dots_popup,
      },
    }
  );
  db.collection("roles").updateOne(
    { role: "team leader" },
    {
      $set: {
        medical_check_three_dots_popup:
          teamLeader_medical_check_three_dots_popup,
      },
    }
  );
  db.collection("roles").updateOne(
    { role: "admin" },
    {
      $set: {
        medical_check_three_dots_popup: admin_medical_check_three_dots_popup,
      },
    }
  );
  db.collection("roles").updateOne(
    { role: "medic" },
    {
      $set: {
        medical_check_three_dots_popup: medic_medical_check_three_dots_popup,
      },
    }
  );
  db.collection("roles").updateOne(
    { role: "esh manager" },
    {
      $set: {
        medical_check_three_dots_popup: eshManager_medical_check_three_dots_popup,
      },
    }
  );
  return res.redirect("/admin-rights-to-roles");
});

app.get("/admin-import-table", isAuth, async (req, res) => {
  
  res.render("admin-import-table", {
    // usersLists: users,
  });
});

app.post("/admin-import-table", async (req, res) => {

  // Get the data from the form
  // console.log(req.files.file);

  // Read the Excel File
  const rows = await readXlsxFile(req.files.file.tempFilePath);
  console.log(rows); // [ [ 'Gid', 'Formal_Name' ], [ 123, 'Ifti' ], [ 456, 'cretu' ] ]
  console.log(rows[0]); // [ 'Gid', 'Formal_Name' ]
  console.log(rows[0][0]); // Gid

  if(!(rows[0][0] == "Gid" && rows[0][1] == "Email" && rows[0][2] == "Supervisor" && rows[0][3] == "last_MM")){ //checking if the table headers are matching the criteria
    console.log("the table headers are invalid");
    req.flash("error", "The table headers are invalid");
    return res.redirect("/admin-import-table");
  }

  let users = await UsersList.find({});
  let usersCount = await UsersList.find({}).countDocuments();
  
  for(let i = 1 ; i < rows.length ; i++){ //we will check the excel document line by line to see if there are any errors
    
    if(!(/^\d+$/.test(rows[i][0]))){ //checking if the Gid has only numbers in its componence
      console.log("ERROR: a Gid should not contain other characters except for numbers!");
      req.flash("error", "ERROR: a Gid should not contain other characters except for numbers!");
      return res.redirect("/admin-import-table");
    }

    if (!(rows[i][1].includes("vitesco"))){ //checking if the email contains @vitesco
      console.log("ERROR: the email address is invalid. It must contain @vitesco.com");
      req.flash("error", "ERROR: the email address is invalid. It must contain @vitesco.com");
      return res.redirect("/admin-import-table");
    }

    //next we are checking if the dates from last_MM are correct
    let numbers = rows[i][3][0] + rows[i][3][1] + rows[i][3][7] + rows[i][3][8];
    let hashtag = rows[i][3][2] + rows[i][3][6];
    let month = rows[i][3][3] + rows[i][3][4] + rows[i][3][5];
    let months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec";
    if( (!(/^\d+$/.test(numbers))) || (hashtag[0] != "#" || hashtag[1] != "#") || (months.indexOf(month) == -1)){
      console.log("ERROR: a date from last_MM does not meet the specified pattern!");
      req.flash("error", "ERROR: a date from last_MM does not meet the specified pattern!");
      return res.redirect("/admin-import-table");
    }

    let ok = 0; //we assume that the supervisor does not exist in the database

    for(let j = 0 ; j < usersCount ; j++){ //checking if some data doesnt already exist in the database

      if(rows[i][0] == users[j].Gid){ //checking if one of the Gids doesnt already exist in the database
        console.log("ERROR: there already exists another user with a Gid like one in the document!");
        req.flash("error", "ERROR: there already exists another user with a Gid like one in the document!");
        return res.redirect("/admin-import-table");
      }

      if(rows[i][1] == users[j].email_angajat){ //checking if one of the email doesnt already exist in the database
        console.log("ERROR: there already exists another user with an email like one in the document!");
        req.flash("error", "ERROR: there already exists another user with an email like one in the document!");
        return res.redirect("/admin-import-table");
      }

      if((rows[i][2] == "-") || (rows[i][2] == "") || (rows[i][2] == users[j].Formal_Name)){
        ok = 1; //there either exists a user with that Name or the user does not have a supervisor
      }

    }

    if(ok == 0){ //if one of the supervisor's names does not exist in the database
      console.log("ERROR: one of the supervisors in the excel document does not exist in the database!!");
      req.flash("error", "ERROR: one of the supervisors in the excel document does not exist in the database!!");
      return res.redirect("/admin-import-table");
    }

    for(let k = i + 1 ; k < rows.length ; k++){ //checking if there are no duplicates in the excel document

      if(rows[i][0] == rows[k][0]){ //checking if there are no identical Gids in the excel document
        console.log("ERROR: there are two identical Gids in the excel document!");
        req.flash("error", "ERROR: there are two identical Gids in the excel document!");
        return res.redirect("/admin-import-table");
      }

      if(rows[i][1] == rows[k][1]){ //checking if there are no identical emails in the excel document
        console.log("ERROR: there are two identical emails in the excel document!");
        req.flash("error", "ERROR: there are two identical emails in the excel document!");
        return res.redirect("/admin-import-table");
      }

    }
  }

    // after we finished with checking the errors, we may add the new users to the database

    for( let m = 1 ; m < rows.length ; m++){ //we start by parsing line by line
      //we will take razvan-stefan.iftimoaia11@vitesco.com as an example
      let firstName = rows[m][1].substring(0, rows[m][1].indexOf("."));
      // console.log(firstName);//output: razvan-stefan
      let lastName = rows[m][1].substring(rows[m][1].indexOf(".") + 1, rows[m][1].indexOf("@"));
      // console.log(lastName);//output: iftimoaia11
      let lastNameWithNoDigits = lastName.replace(/[0-9]/g, '');
      // console.log(lastNameWithNoDigits);//output: iftimoaia
      let gid = rows[m][0];

      let Formal_Name = "";
      if (lastNameWithNoDigits[lastNameWithNoDigits.length - 1] == " ") {
        Formal_Name = lastNameWithNoDigits + firstName;
      } else {
        Formal_Name = lastNameWithNoDigits + " " + firstName;
      }
      let auxiliar = capitalizeTheFirstLetterOfEachWord(Formal_Name);
      Formal_Name = auxiliar;
      auxiliar = capitalizeTheFirstLetterOfEachWord(firstName);
      firstName = auxiliar;
      auxiliar = capitalizeTheFirstLetterOfEachWord(lastNameWithNoDigits);
      lastName = auxiliar;
      // console.log("----------");
      // console.log(Formal_Name);
      // console.log(firstName);
      // console.log(lastName);

      //checking if there are other users with the same name in the database 
      let regex = new RegExp(Formal_Name, "i");
      let otherUsersWithSameName = await UsersList.find({Formal_Name: { $regex: regex}}); //regex was used so we can match UserName with UserName Gid
      // console.log("-----------------------------");
      // console.log(otherUsersWithSameName[0]);
      // console.log("-----------------------------");
      if(otherUsersWithSameName[0]){ //if there are other users with the same name
        Formal_Name = Formal_Name + " " + gid;
        let usersCounter = await UsersList.find({Formal_Name: { $regex: regex}}).countDocuments();
        for( let i = 0; i < usersCounter; i++ ){//updating all users' Formal_Name (adding their Gid in the Formal_Name)
          let otherUserFirst_Name = otherUsersWithSameName[i].First_Name;
          let otherUserFamily_Name = otherUsersWithSameName[i].Family_Name;
          let otherUserGid = otherUsersWithSameName[i].Gid;
          let otherUserFormal_Name = otherUserFamily_Name + " " + otherUserFirst_Name + " " + otherUserGid;
          let otherUserId = otherUsersWithSameName[i]._id;
          db.collection("users").updateOne( //updating the other existing users
            { _id: otherUserId },
            {
              $set: {
                Formal_Name: otherUserFormal_Name,
              },
            }
          );
        }
      }

      //linking the user to the supervisor
      let superEmail = "-";
      let Supervisor = rows[m][2];
      if( Supervisor != "-"){
      let supervisorEmail = await UsersList.findOne({
        Formal_Name: Supervisor,
      });
      superEmail = supervisorEmail.email_angajat;
      }
      async function assignUserToSupervisor(userId, supervisorEmail){ //this function is used later to push the new user's id into the "supervising" field of the supervisor
        if ( supervisorEmail != "-"){
          // console.log(userId);
          // console.log(supervisorEmail);
          let supervisors = await UsersList.find({ email_angajat: supervisorEmail }).populate({
            path: "supervising",
          });
          // console.log(supervisors[0]);
          supervisors[0].supervising.push(userId);
          await supervisors[0].save();
        } else {
          // console.log("utilizatorul nu are supervisor");
        }
      }
      //the assign function will be used later


      //last_MM and next_MM part
      let Last_MM = rows[m][3];
      Last_MM = Last_MM.replace(/#/g, "-");
      Last_MM = new Date(Last_MM);
  
      let Next_MM = new Date(Last_MM);
      let Next_MM_String;
      let Last_MM_String;
      Next_MM.setFullYear(Next_MM.getFullYear()+1);
      Next_MM_String = Next_MM.getFullYear() + '-' + ('0' + (Next_MM.getMonth()+1)).slice(-2) + '-' + ('0' + Next_MM.getDate()).slice(-2);
      Last_MM_String = Last_MM.getFullYear() + '-' + ('0' + (Last_MM.getMonth()+1)).slice(-2) + '-' + ('0' + Last_MM.getDate()).slice(-2);

      let real_last_mm = reverseDateToDate(Last_MM_String);
      let real_next_mm = reverseDateToDate(Next_MM_String);

      let email_angajat = rows[m][1];
      //create a password
      let token = getPassword();
      let token_vizibil = token;


      //create the user with the following data
      //-Formal_Name, -firstName, -lastName, -gid, -email_angajat, -superEmail, -Supervisor, -real_last_mm, -real_next_mm
      // let idUser = newUser._id;
      // assignUserToSupervisor(idUser, superEmail);
      // sendRegisterEmail(email_angajat, token_vizibil);


      // console.log("---setting up a new user---");
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(token, salt, function (err, hasdPsw) {
          if (err) return next(err);
          const newUser = new UsersList({
            Gid: gid,
            email_angajat: email_angajat,
            Formal_Name: Formal_Name,
            First_Name: firstName,
            Family_Name: lastName,
            Supervisor: Supervisor,
            email_superior: superEmail,
            Last_MM: real_last_mm,
            Next_MM: real_next_mm,
            Medical_limitations: "-",
            token: hasdPsw,
            token_vizibil: token_vizibil,
            permission: "basic",
            register_verification: "1",
          });
          newUser.save();
          let idUser = newUser._id;
          assignUserToSupervisor(idUser, superEmail);
          sendRegisterEmail(email_angajat, token_vizibil);
        });
      });

    }

  

  // let fakeGid = "1234";
  // let isnum = /^\d+$/.test(fakeGid);
  // if(isnum){
  //   console.log("the gid has only numbers");
  // } else {
  //   console.log("the gid does not respect the criteria");
  // }

  

  
  // Delete the temp file
  fs.unlinkSync(req.files.file.tempFilePath);
  return res.redirect("/admin-import-table");
});

app.get(
  "/ssm-su",
  isAuth,
  /*authenticateToken, */ (req, res) => {
    res.render("ssm-su", {
      title: "SSM and SU Status",
      userLogin: req.user,
      userLoggedIn: req.loginStatus,
      page: "SSM and SU",
      link: "ssm-su",
    });
  }
);

app.get(
  "/competency-management",
  isAuth,
  /*authenticateToken, */ (req, res) => {
    res.render("index", {
      title: "Competency management",
      userLogin: req.user,
      userLoggedIn: req.loginStatus,
      page: "Competency management",
      link: "competency-management",
    });
  }
);

app.get(
  "/dashboard",
  isAuth,
  /*isLoggedIn ,*/ /*authenticateToken,*/ async (req, res) => {
    let roles = await Roles.find({});
    if (roles != "") {
      //daca roles exista
      // console.log("roles exista");
      let sessionRole = req.session.role;
      let roles2 = await Roles.findOne({ role: sessionRole });
      req.session.medical_check_three_dots_popup =
        roles2.medical_check_three_dots_popup;
    } else {
      const newBasicRole = new Roles({
        role: "basic",
        medical_check_three_dots_popup: "0",
      });
      newBasicRole.save();
      const newAdminRole = new Roles({
        role: "admin",
        medical_check_three_dots_popup: "0",
      });
      newAdminRole.save();
      const newTeamLeaderRole = new Roles({
        role: "team leader",
        medical_check_three_dots_popup: "0",
      });
      newTeamLeaderRole.save();
      const newMedicRole = new Roles({
        role: "medic",
        medical_check_three_dots_popup: "0",
      });
      newMedicRole.save();
      // nu merge sa asignam drepturile rolului respectiv sesiunii inca
      // baza de date trebuie creata intai
    }

    res.render("index", {
      title: "Dashboard",
      userLogin: req.user,
      userLoggedIn: req.loginStatus,
      page: "Dashboard",
      link: "dashboard",
    });
  }
);

app.get(
  "/profile",
  isAuth,
  /*authenticateToken, */ (req, res) => {
    res.render("profile", {
      title: "Profile",
      userLogin: req.user,
      userLoggedIn: req.loginStatus,
      page: "Profile",
      link: "profile",
    });
  }
);

// login routing
// app.get("/login", (req, res) => {
//   res.render("login", {
//     title: "Profile",
//     userProfile: loginIdUser,
//     userComputer: loginIdComputer,
//   });
// });

app.post("/api/login", isAuth, (req, res) => {
  // ...
  const token = generateAccessToken({ username: "test" }); //req.body.username });
  res.cookie("authcookie", token, {
    expires: new Date(Date.now() + process.env.ACCESS_TOKEN_LIFE * 999), // cookie will be removed after one year
  });
  return res.redirect("/dashboard");
  // ...
});

app.post("/api/logout", isAuth, (req, res) => {
  //
  res.cookie("authcookie", null, {
    expires: new Date(Date.now()), // invalidate cookie will expire now
  });
  return res.redirect("/");
  res.json("logout");
  // ...
});

/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
