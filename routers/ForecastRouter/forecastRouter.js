const express = require("express");
const forecastingCtr = require("../../controller/Authcontrollers/Forecast/forecastingCtr");
const verifyToken = require("../../Auth/verifyAuth");

const forecastRouter = express.Router();

forecastRouter.use(verifyToken);
forecastRouter.get("/TeamForecast", forecastingCtr.TeamforecastReports);
forecastRouter.post(
  "/ProjectForecast",
  forecastingCtr.projectforecastingReports
);
module.exports = forecastRouter;
