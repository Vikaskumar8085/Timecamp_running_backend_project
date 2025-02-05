const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const {
  globalErrorHanadler,
  NotFoundHandler,
} = require("../middleware/ErrorHandler");
const indexRouter = require("../routers");
const csvuploadCtr = require("../controller/Authcontrollers/Csvupload/csvuploadCtr");
require("../config/dbconfig");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(hpp());
app.use(mongoSanitize());
app.use("/api", indexRouter);
app.get("/client-data", csvuploadCtr.generateClientCsvFile);
app.get("/employee-csv", csvuploadCtr.generateEmployeecsv);
app.use(globalErrorHanadler);
app.use(NotFoundHandler);

module.exports = app;
