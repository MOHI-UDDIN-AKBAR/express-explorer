const express = require("express");
const path = require("path");
const router = require("./routes/index.js");

const app = express();

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

app.use(router);

module.exports = app;
