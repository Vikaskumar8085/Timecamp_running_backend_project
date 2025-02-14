const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const adminRouter = require("./adminRouter/adminRouter");
const DataModel = require("../models/Datamodel");
const ChartData = require("../models/Chart");

const jwt = require("jsonwebtoken");
const userRouter = require("./userRouter/userRouter");
const masterRouter = require("./masterRouter/masterRouter");
const uploadcsvRouter = require("./Uploadcsv/uploadcsvRouter");
const admindashRouter = require("./adminRouter/admindashRouter");
const clientRouter = require("./clientRouter/clientRouter");
const contractorRouter = require("./contractorRouter/contractorRouter");
const employeeRouter = require("./employeeRouter/employeeRouter");
const projectCtr = require("../controller/Project/projectCtr");
const Project = require("../models/Othermodels/Projectmodels/Project");
const RoleResource = require("../models/Othermodels/Projectmodels/RoleResources");
const milestoneCtr = require("../controller/Milestone/MilestoneCtr");
const MilestoneRouter = require("./MilestornRouter/MilestoneRouter");
const timesheetRouter = require("./timesheetRouter/TimesheetRouter");

const upload = multer({dest: "uploads/"});

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

module.exports = indexRouter;
