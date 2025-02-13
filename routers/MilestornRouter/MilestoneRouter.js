const express = require("express");
const milestoneCtr = require("../../controller/Milestone/MilestoneCtr");
const verifyToken = require("../../Auth/verifyAuth");

const MilestoneRouter = express.Router();

MilestoneRouter.post(
  "/create-milestone/:projectid",
  verifyToken,
  milestoneCtr.createmilestone
);

module.exports = MilestoneRouter;
