const asyncHandler = require("express-async-handler");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");

const milestoneCtr = {
  createmilestone: asyncHandler(async (req, res) => {
    try {
      const milestones = req.body; // Expecting an array of milestone objects

      if (!Array.isArray(milestones) || milestones.length === 0) {
        return res.status(400).json({
          message: "Milestones data is required and should be an array.",
        });
      }

      let insertedMilestones = [];

      for (const item of milestones) {
        const milestone = new Milestone({
          Compnay_Id: "1",
          Name: item.Name,
          Description: item.Description,
          Start_date: new Date(item.Start_date),
          End_date: new Date(item.End_date),
        });

        const savedMilestone = await milestone.save();
        insertedMilestones.push(savedMilestone);
      }

      res.json({
        message: "Bulk upload successful!",
        insertedCount: insertedMilestones.length,
      });

      // console.log(insertedMilestones, "dasldkfskd");
      //
      // return res.status(HttpStatusCodes.OK).json({
      //   message: "add milestone successfully",
      //   success: true,
      //   result: insertedMilestones,
      // });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = milestoneCtr;
