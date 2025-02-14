const express = require("express");
const TimesheetSummaryCtr = require("../../controller/TimesheetCtr/TimesheetSummaryCtr");
const verifyToken = require("../../Auth/verifyAuth");

const timesheetRouter = express.Router();
// total hour by resources
timesheetRouter.get(
  "/totalhourbyresources",
  verifyToken,
  TimesheetSummaryCtr.TotalHourByResourses
);
// total hour by resources
// hour by projects
timesheetRouter.get(
  "/hourbyprojects",
  verifyToken,
  TimesheetSummaryCtr.HoursByProject
);
// hour by projects

timesheetRouter.get(
  "/hourbycompany",
  verifyToken,
  TimesheetSummaryCtr.HourByCompany
);

module.exports = timesheetRouter;
