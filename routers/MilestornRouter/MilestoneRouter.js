const express = require("express");
const milestoneCtr = require("../../controller/Milestone/MilestoneCtr");
const verifyToken = require("../../Auth/verifyAuth");

const MilestoneRouter = express.Router();

MilestoneRouter.post(
  "/create-milestone/:projectid",
  verifyToken,
  milestoneCtr.createmilestone
);
MilestoneRouter.get(
  "/fetch-milestone/:id",
  verifyToken,
  milestoneCtr.fetchmilestone
);
MilestoneRouter.get(
  "/fetch-milestone-resources/:id",
  verifyToken,
  milestoneCtr.fetchmilestoneprojects
);

module.exports = MilestoneRouter;
