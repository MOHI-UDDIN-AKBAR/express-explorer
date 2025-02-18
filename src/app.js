const express = require("express");
const cors = require("cors");
const Busboy = require("busboy");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const winston = require("winston");

const app = express();

const allowedOrigins = ["http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-API-Key"],
  exposedHeaders: ["Content-Length"],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const customMorganFormats = `"User IP = :remote-addr"\n - "User = :remote-user"\n "Log at = [:date[clf]]"\n "Method = :method, Url = :url, HTTP version = :http-version"\n "Status code = :status"\n "Referrer = :referrer"\n "User agent = :user-agent"\n "Response size = :res[content-length]"\n "Response time = :response-time ms"\n`;

app.use(morgan(customMorganFormats));
const {
  createLogger,
  format: {
    combine,
    json,
    simple,
    splat,
    timestamp,
    printf,
    colorize,
    prettyPrint,
    errors,
  },
  transports: { Console, File },
} = winston;

const customLevels = {
  levels: {
    critical: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    verbose: 5,
    silly: 6,
  },
  colors: {
    critical: "red",
    error: "red",
    warn: "yellow",
    info: "green",
    debug: "blue",
    verbose: "cyan",
    silly: "magenta",
  },
};

winston.addColors(customLevels.colors);

const customFormat = printf(({ timestamp, level, message, ...metadata }) => {
  // console.log(metadata);

  const info = {
    method: metadata.req.method,
    path: metadata.req.path,
  };

  delete metadata.req;

  return JSON.stringify(
    {
      timestamp,
      level,
      message,
      ...info,
      application: "my-app",
      environment: process.env.NODE_ENV,
    },
    null,
    2
  );
});

const logger = createLogger({
  levels: customLevels.levels,
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), customFormat),
  transports: [
    new Console(),
    new File({
      filename: path.join(__dirname, "combine.log"),
    }),
  ],
});

app.use((req, res, next) => {
  logger.info("Request received", { req });
  next();
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
  console.log(req.headers);
  const busboy = Busboy({ headers: req.headers });
  const uploadsDir = path.join(__dirname, "assets");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  busboy.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    // console.log(file);
    console.log(
      `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
      filename,
      encoding,
      mimeType
    );
    const savePath = path.join(uploadsDir, filename);
    const writeStream = fs.createWriteStream(savePath);
    file.pipe(writeStream);

    file
      .on("data", (data) => {
        console.log(`File [${name}] got ${data.length} bytes`);
      })
      .on("end", () => {
        console.log(`File [${name}] end`);
      })
      .on("close", () => {
        console.log(`File [${name}] closed`);
      });
  });
  busboy.on("field", (name, val, info) => {
    console.log(`Field [${name}]: value: %j`, val);
  });
  busboy.on("finish", () => {
    console.log("ok finish");
  });

  busboy.on("close", () => {
    console.log("Done parsing form!");
    res.send("file uploaded successful ! ");
  });
  req.pipe(busboy);
});

app.delete("/users/:id", function (req, res, next) {
  console.log(req.headers);
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.put("/data", (req, res) => {
  res.json({ message: "PUT request successful!" });
});

module.exports = app;
