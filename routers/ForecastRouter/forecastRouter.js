const express = require("express");
const forecastingCtr = require("../../controller/Authcontrollers/Forecast/forecastingCtr");
const verifyToken = require("../../Auth/verifyAuth");

const forecastRouter = express.Router();

forecastRouter.use(verifyToken);
forecastRouter.get("/TeamForecast", forecastingCtr.TeamforecastReports);

module.exports = forecastRouter;
