const express = require("express");
const path = require("path");
const { routerOne, routerTwo } = require("./routes/index.js");

const app = express();

app.locals.title = "My App";
app.locals.email = "admin@gmail.com";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  express.json({
    limit: "1mb",
    type: "application/json",
    strict: true,
    inflate: true,
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length > 0) {
        console.log("Received JSON payload:", buf.toString());
      }
    },
    reviver: (key, value) => (key === "date" ? new Date(value) : value),
  })
);

app.use(
  "/static",
  express.static(path.join(__dirname, "public"), {
    dotfiles: "deny",
    etag: true,
    extensions: ["html", "css"],
    index: "index.html",
    lastModified: true,
    maxAge: "1d",
    redirect: true,
    setHeaders: (res, path, stats) => {
      res.set("X-Timestamp", Date.now());
    },
  })
);

// app.use(routerOne);
// app.use(routerTwo);

app.get("/", (req, res) => {
  res.render("home");
});

module.exports = app;
