const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const https = require("https");
// const http = require("http")
const fs = require("fs");
const connectDB = require("./config/db");
const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");
const { fileStorage, fileFilter } = require("./multer");
const dotenv = require("dotenv");
dotenv.config()

const Port = process.env.PORT || 8071;
//basic cors handeling
app.use(cors());
app.options("*", cors());
app.use(express.json());
dotenv.config();

//db connection
connectDB();

//init middleware of multer
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).fields([
    {
      name: "user_image",
      maxCount: 1,
    },
    {
      name: "emoji_image",
      maxCount: 1,
    },
    {
      name: "video_files",
      maxCount: 5,
    },
    {
      name: "post_pics",
      maxCount: 5,
    },
    {
      name: "ad_image",
      maxCount: 1,
    },
  ])
);

//for limiting the api calls
const limiter = rateLimit({
  max: 1000000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

//For Uploads
const __dirname1 = path.resolve();
console.log(__dirname1);
app.use("/uploads", express.static(path.join(__dirname1, "/uploads")));
app.use("/api/download/uploads/:file_name", function (req, res) {
  console.log("IN HERE", req.params);
  const file = `${__dirname}/uploads/${req.params.file_name}`;
  res.download(file); // Set disposition and send it.
});
const local = false;
let credentials = {};
if (local) {
  credentials = {
    key: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.key", "utf8"),
    cert: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.crt", "utf8"),
    ca: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.ca"),
  };
} else {
  credentials = {
    key: fs.readFileSync("../certs/ssl.key"),
    cert: fs.readFileSync("../certs/ssl.crt"),
    ca: fs.readFileSync("../certs/ca-bundle"),
  };
}

//for handling the routes
require("./routes")(app);

app.get("/", (req, res) => {
  res.send("Truthout Server Running");
});

app.all("*", (req, res) => {
  res.json({ message: `Can't find ${req.originalUrl} on this server!` });
});

var httpsServer = https.createServer(credentials, app);
// var httpServer = http.createServer(app)

const server = httpsServer.listen(Port, () => {
  console.log(`Server is running at the port  ${Port}`);
});

// const server = httpServer.listen(Port, () => {
//   console.log(`Server is running at the port  ${Port}`);
// });

const io = require("./utils/Socket").init(server);
io.on("connection", (socket) => {
  console.log("client joined");
  // console.log(socket)
  socket.on("joinRoom", (userId) => {
    console.log("Room Joined. ROOM ID: ", userId);
    socket.join(userId);
  });
  //Listen for Chat Message
  socket.on("coordinates", (coordinates) => {
    console.log(coordinates);
    io.in(coordinates.userId).emit("coordinates", coordinates.coordinates);
  });
  //soa socket
  socket.on("soa_chat", async (data) => {
    console.log("datatata: ", data);
    io.in(data.toid.toString()).emit("soa_chat", data);
  });
  // When User Disconnects
  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});
