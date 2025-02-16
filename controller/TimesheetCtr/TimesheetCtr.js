const asyncHandler = require("express-async-handler");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");

const TimesheetCtr = {
  // create timesheet
  create_timesheet: asyncHandler(async (req, res) => {
    try {
      const response = await TimeSheet(req.body);
      if (!response) {
        // resturn
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: response });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   fetch timesheet
  fetch_timesheet: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      console.log(checkcompany);
      let queryObj = {};

      queryObj = {
        CompanyId: checkcompany.Company_Id,
      };
      const response = await TimeSheet.find(queryObj);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Not Found Timesheet");
      }

      const timesheetfetchdata = await Promise.all(
        response.map(async (item) => {
          const getprojectName = await Project.find({
            ProjectId: item.project,
          });

          let ProjectName = await getprojectName.map((projectitem) => {
            return projectitem.Project_Name;
          });

          const fetchStaff = await StaffMember.find({
            staff_Id: item.Staff_Id,
          });

          let StaffName = await fetchStaff.map((staffItem) => {
            return staffItem.FirstName;
          });

          const timesheetresponse = {
            ProjectName: ProjectName,
            StaffName: StaffName,
            ...item.toObject(),
          };

          return timesheetresponse;
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: timesheetfetchdata });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   project timesheet
  fetch_project_time: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: checkcompany.Company_Id,
      };
      // Step 1: Find all projects for the given CompanyId
      const projects = await Project.find(queryObj);

      if (!projects || projects.length === 0) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ message: "No projects found" });
      }

      // Extract project IDs
      const projectIds = await projects.map((project) => project.ProjectId);

      // Step 2: Aggregate TimeSheet data for these projects
      const timesheetData = await TimeSheet.aggregate([
        {
          $match: {
            CompanyId: checkcompany.Company_Id,
            project: { $in: projectIds },
          },
        },
        {
          $group: {
            _id: "$project",
            totalHours: { $sum: { $toDouble: "$hours" } },
            okHours: { $sum: { $toDouble: "$ok_hours" } },
            billedHours: { $sum: { $toDouble: "$billed_hours" } },
            totalEntries: { $sum: 1 }, // Count total entries for this project
          },
        },
      ]);

      // Step 3: Map the results back to the projects
      const result = projects.map((project) => {
        const projectTimesheet = timesheetData.find(
          (ts) => ts._id === project.ProjectId
        ) || {
          totalHours: 0,
          okHours: 0,
          billedHours: 0,
          totalEntries: 0,
        };

        return {
          ProjectId: project.ProjectId,
          ProjectName: project.Project_Name,
          ProjectCode: project.Project_Code,
          StartDate: project.Start_Date,
          EndDate: project.End_Date,
          TotalHours: projectTimesheet.totalHours,
          OkHours: projectTimesheet.okHours,
          BilledHours: projectTimesheet.billedHours,
          TotalEntries: projectTimesheet.totalEntries,
        };
      });

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = TimesheetCtr;
