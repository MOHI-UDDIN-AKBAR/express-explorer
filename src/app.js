const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "assets"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-z0-9.]/gi, "_");
    cb(null, `${uniqueSuffix + sanitizedName}`);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: {
    files: 1,
    fileSize: 3 * 1024 * 1024,
    parts: 4,
    fields: 2,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image file are allowed"), false);
    }
    cb(null, true);
  },
});

app.get("/", (req, res) => {
  res.send(`
    <form action="/profile" method="post" enctype="multipart/form-data">
      <div>
        <label for="username">Username:</label>
        <input type="text" name="username" id="username"/>
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" name="email" id="email"/>
      </div>
      <div>
        <label for="profile-picture">Profile Picture:</label>
        <input type="file" name="avatar" id="profile-picture"/>
      </div>
      <button type="submit">Submit</button>
    </form>
  `);
});

app.post("/profile", (req, res) => {
  const uploadMiddleware = upload.single("avatar");
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).send(err.message);
      }
      return res.status(400).send(`Error: ${err.message}`);
    }

    if (!req.file) {
      res.status(400).send("No file uploaded.");
    }
    console.log(`User is : `, req.body);
    res.send("Form submitted successfully!");
  });
});

module.exports = app;
