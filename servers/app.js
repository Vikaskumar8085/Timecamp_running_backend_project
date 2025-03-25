const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const cron = require("node-cron");
const {
  globalErrorHanadler,
  NotFoundHandler,
} = require("../middleware/ErrorHandler");
const indexRouter = require("../routers");
const {
  clientstatuschange,
  projectstatuschanger,
} = require("../utils/functions");
require("../config/dbconfig");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));
app.use(helmet());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(hpp());
app.use(mongoSanitize());
app.use("/api", indexRouter);
app.use(globalErrorHanadler);
app.use(NotFoundHandler);
// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  clientstatuschange();
  projectstatuschanger();
});

module.exports = app;
