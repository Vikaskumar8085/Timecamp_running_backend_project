const express = require("express");
const TimesheetSummaryCtr = require("../../controller/TimesheetCtr/TimesheetSummaryCtr");
const verifyToken = require("../../Auth/verifyAuth");

const timesheetRouter = express.Router();

timesheetRouter.get(
  "/totalhourbyresources",
  verifyToken,
  TimesheetSummaryCtr.TotalHourByResourses
);

module.exports = timesheetRouter;
