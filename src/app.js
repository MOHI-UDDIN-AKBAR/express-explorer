const express = require("express");
const Busboy = require("busboy");
const path = require("path");
const fs = require("fs");

const app = express();

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
  const busboy = Busboy({ headers: req.headers });
  const uploadsDir = path.join(__dirname, "assets");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  busboy.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    console.log(
      `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
      filename,
      encoding,
      mimeType
    );
    const savePath = path.join(uploadsDir, filename);
    const writeStream = fs.createWriteStream(savePath);

    file
      .on("data", (data) => {
        console.log(`File [${name}] got ${data.length} bytes`);
      })
      .on("close", () => {
        console.log(`File [${name}] done`);
      });

    file.pipe(writeStream);
  });
  busboy.on("field", (name, val, info) => {
    console.log(`Field [${name}]: value: %j`, val);
  });
  busboy.on("close", () => {
    console.log("Done parsing form!");
    res.send("file uploaded successful ! ");
  });
  req.pipe(busboy);
});

module.exports = app;
