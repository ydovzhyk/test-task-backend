const express = require("express");
const session = require("express-session");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRouter = require("./routes/api/auth");
const technicalRouter = require("./routes/api/technical");
const apartmentsRouter = require("./routes/api/apartment");
const ordersRouter = require("./routes/api/orders");
const smsRouter = require("./routes/api/sms");
const googleRouter = require("./routes/api/google");
const textDataRouter = require("./routes/api/textData");
const chatRouter = require("./routes/api/chat");
const recordsRouter = require("./routes/api/records");

const { GOOGLE_CLIENT_SECRET } = process.env;

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));

// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://ydovzhyk.github.io",
//   "https://speakflow.netlify.app",
// ];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };
// app.use(cors(corsOptions));
app.use(cors({ credentials: false, origin: "*" }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/technical", technicalRouter);
app.use("/apartments", apartmentsRouter);
app.use("/orders", ordersRouter);
app.use("/sms", smsRouter);
app.use("/textData", textDataRouter);
app.use('/chat', chatRouter);
app.use('/records', recordsRouter);

app.use(
  "/google",
  session({
    secret: `${GOOGLE_CLIENT_SECRET}`,
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/google", googleRouter);

const staticPath = path.resolve("public/");
app.use(express.static(staticPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(staticPath, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.log(err); // eslint-disable-line
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({
    message,
  });
});

module.exports = app;
