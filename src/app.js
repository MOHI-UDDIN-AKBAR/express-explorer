const express = require("express");
const path = require("path");
const { routerOne, routerTwo } = require("./routes/index.js");

const app = express();

app.locals.title = "My App";
app.locals.email = "admin@gmail.com";

app.set("strict routing", true);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.set("etag", "strong");

app.set("json spaces", 4);

app.set("json escape", true);

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
  res.append("Link", ["<http://localhost/>", "<http://localhost:3000/>"]);
  res.append("Warning", "199 Miscellaneous warning");
  res.render("home");
});

app.get("/json", (req, res) => {
  res.status(200).json({ name: "Samir", id: 1 });
});

app.get("/test", (req, res) => {
  res.send("This is /test route.");
});

app.get("/test/", (req, res) => {
  res.send("This is /test/ route.");
});

app.get("/api/data", (req, res) => {
  const data = {
    text: '<script>alert("XSS")</script>',
  };
  res.json(data);
});

app.disable("trust proxy");
console.log(app.get("trust proxy"));
console.log(app.disabled("trust proxy"));

app.enable("trust proxy");
console.log(app.get("trust proxy"));
console.log(app.enabled("trust proxy"));

app.get("/ip", (req, res) => {
  res.send(`Client IP: ${req.ip}`);
});

app.get("/hello/ok", (req, res) => res.send(`path: ${req.path}`));

let userCredits = 5;
app.get("/download", (req, res) => {
  const options = {
    dotfiles: "deny",
  };
  if (userCredits > 0) {
    res.download(
      path.join(__dirname, "./assets/images/Clouds.jpg"),
      "image.jpg",
      options,
      (err) => {
        if (err) {
          console.error("Download failed:", err);
        } else {
          console.log("File downloaded successfully");
          userCredits -= 1;
        }
      }
    );
  } else {
    res.status(403).send("Not enough credits to download the file");
  }
});

app.set("jsonp callback name", "cb");
app.get("/jsonp", (req, res) => {
  res.jsonp({ user: "tobi" });
});

app.get("/old-route", (req, res) => {
  res.redirect("/new-route");
});

app.get("/html-text", (req, res) => {
  const buffer = Buffer.from("<h1>Hello World</h1>");
  res.set("Content-Type", "text/html");
  res.send(buffer);
});

module.exports = app;
