const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();

app.use("/assets", express.static(path.join(__dirname, "assets")));

const storageDestination = multer.diskStorage({
  destination: path.join(__dirname, "assets"),
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storageDestination });

app.get("/", (req, res) => {
  res.send(
    `<form action="/profile" method="post" enctype="multipart/form-data">
      <input type="file" name="avatar" />
      <button type="submit">Upload Avatar</button>
    </form>`
  );
});

app.post("/profile", upload.single("avatar"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("File not uploaded");
  }

  return res.redirect(`/assets/${req.file.filename}`);
});

module.exports = app;
