const express = require("express");

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

module.exports = app;
