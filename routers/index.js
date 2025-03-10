const express = require("express");
const adminRouter = require("./adminRouter/adminRouter");
const userRouter = require("./userRouter/userRouter");
const masterRouter = require("./masterRouter/masterRouter");
const uploadcsvRouter = require("./Uploadcsv/uploadcsvRouter");
const admindashRouter = require("./adminRouter/admindashRouter");
const clientRouter = require("./clientRouter/clientRouter");
const contractorRouter = require("./contractorRouter/contractorRouter");
const employeeRouter = require("./employeeRouter/employeeRouter");
const MilestoneRouter = require("./MilestornRouter/MilestoneRouter");
const managerRouter = require("./managerRouter/managerRouter");
const timesheetRouter = require("./TimesheetRouter/TimesheetRouter");

const indexRouter = express.Router();

indexRouter.use("/v1/user", userRouter);
indexRouter.use("/v1/admin", adminRouter);
indexRouter.use("/v1/master", masterRouter);
indexRouter.use("/v1/csv-upload", uploadcsvRouter);
indexRouter.use("/v2/admin-dash", admindashRouter);
indexRouter.use("/v2/client", clientRouter);
indexRouter.use("/v2/contractor", contractorRouter);
indexRouter.use("/v2/employee", employeeRouter);
indexRouter.use("/v2/milestone", MilestoneRouter);
indexRouter.use("/v2/timesheet", timesheetRouter);
indexRouter.use("/v2/manager", managerRouter);


module.exports = indexRouter;
