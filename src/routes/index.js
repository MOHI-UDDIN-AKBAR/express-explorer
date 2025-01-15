const express = require("express");

// Example One: Router without a base path
const routerOne = express.Router();

routerOne.use((req, res, next) => {
  console.log("Middleware that applies to all routes in routerOne");
  next();
});

routerOne.get("/", (req, res) => {
  res.send("Home Page");
});

routerOne.get("/about", (req, res) => {
  res.send("About Page");
});

// Example Two: Router with a base path `/admin`
const routerTwo = express.Router();

routerTwo.use("/admin", (req, res, next) => {
  console.log("Admin middleware triggered");
  next();
});

routerTwo.get("/admin", (req, res) => {
  res.send("Admin Dashboard");
});

routerTwo.get("/admin/settings", (req, res) => {
  res.send("Admin Settings");
});

module.exports = { routerOne, routerTwo };
