const asyncHandler = require("express-async-handler");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const Company = require("../../models/Othermodels/Companymodels/Company");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");

const milestoneCtr = {
  createmilestone: asyncHandler(async (req, res) => {
    const {projectid} = req.params;
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
          Name: item.MilestoneName,
          Description: item.Description,
          Start_date: new Date(item.StartDate),
          End_date: new Date(item.EndDate),
        });

        const savedMilestone = await milestone.save();
        insertedMilestones.push(savedMilestone);
      }

      // res.json({
      //   message: "Bulk upload successful!",
      //   insertedCount: insertedMilestones.length,
      // });

      // console.log(insertedMilestones, "dasldkfskd");

      return res.status(HttpStatusCodes.OK).json({
        message: " milestone created successfully",
        success: true,
        result: insertedMilestones,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchmilestone: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        ProjectId: parseInt(req.params.id),
      };

      const response = await Milestone.find(queryObj);
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchmilestoneprojects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {
        ProjectId: parseInt(req.params.id),
      };

      const response = await Milestone.find(queryObj);

      if (response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Milestone not found");
      }

      const resourceNamewithid = await Promise.all(
        response.map(async (item) => {
          const findprojectResources = await RoleResource.find({
            ProjectId: item.ProjectId,
          });

          const findresourcesRRid = await findprojectResources.map(
            (rrid) => rrid.RRId
          );

          const getresources = await StaffMember.find({
            staff_Id: findresourcesRRid,
          });

          const responseResult = {
            ...item.toObject(),
            Resourcedata: getresources.map((resource) => ({
              staff_id: resource.staff_Id, // Fetching staff_id
              FirstName: resource.FirstName, // Fetching FirstName
            })),
          };

          return responseResult;
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: resourceNamewithid});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = milestoneCtr;
