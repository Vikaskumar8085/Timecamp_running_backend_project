const express = require("express");
const verifyToken = require("../../Auth/verifyAuth");
const admindashboardCtr = require("../../controller/Authcontrollers/admin/admindashboardCtr");

const admindashRouter = express.Router();

admindashRouter.get(
  "/dashboard-data",
  verifyToken,
  admindashboardCtr.fetchtotalCounter
);
admindashRouter.get(
  "/fetch-dash-recent-project",
  verifyToken,
  admindashboardCtr.fetchrecentproject
);
module.exports = admindashRouter;
