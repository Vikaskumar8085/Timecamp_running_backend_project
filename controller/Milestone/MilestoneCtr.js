const asyncHandler = require("express-async-handler");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const Company = require("../../models/Othermodels/Companymodels/Company");

const milestoneCtr = {
  createmilestone: asyncHandler(async (req, res) => {
    const milestones = req.body;
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      console.log(checkcompany);

      if (!Array.isArray(milestones) || milestones.length === 0) {
        return res.status(400).json({
          message: "Milestones data is required and should be an array.",
        });
      }

      let insertedMilestones = [];

      for (const item of milestones) {
        const milestone = new Milestone({
          Compnay_Id: checkcompany?.Compnay_Id,
          ProjectId: projectid,
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
