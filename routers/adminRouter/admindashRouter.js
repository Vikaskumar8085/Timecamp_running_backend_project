const express = require("express");
const verifyToken = require("../../Auth/verifyAuth");
const admindashboardCtr = require("../../controller/Authcontrollers/admin/admindashboardCtr");

const admindashRouter = express.Router();

admindashRouter.get(
  "/dashboard-data",
  verifyToken,
  admindashboardCtr.fetchtotalCounter
);

module.exports = admindashRouter;
