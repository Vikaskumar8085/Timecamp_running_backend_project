const asyncHandler = require("express-async-handler");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");

const milestoneCtr = {
  createmilestone: asyncHandler(async (req, res) => {
    try {
      const response = await Milestone.insertMany(req.body);
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
      }
      return res.status(HttpStatusCodes.OK).json({
        message: "add milestone successfully",
        success: true,
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
