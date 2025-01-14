const express = require("express");
const router = express.Router();

const middleWareOne = (req, res, next) => {
  console.log("MiddleWare One");
  next();
};

const middleWareTwo = (req, res, next) => {
  console.log("MiddleWare Two");
  next();
};

router.use((req, res, next) => {
  console.log(`Global MiddleWare`);
  next();
});

router.get("/", middleWareOne, (req, res) => {
  res.send("Hello World");
});

router.get("/about", middleWareOne, middleWareTwo, (req, res) => {
  res.send("About Page");
});

module.exports = router;
