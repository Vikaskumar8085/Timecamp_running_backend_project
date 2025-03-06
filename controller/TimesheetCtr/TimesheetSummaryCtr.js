const asyncHandler = require("express-async-handler");
const User = require("../../models/AuthModels/User/User");
const Company = require("../../models/Othermodels/Companymodels/Company");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");

const TimesheetSummaryCtr = {
  TotalHourByResourses: asyncHandler(async (req, res) => {
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
      const findresourse = await StaffMember.find({
        CompanyId: checkcompany.Company_Id,
      });
      console.log(findresourse, "dasdkfjsdkl");

      if (!findresourse || findresourse.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No resources found");
      }

      let resultArray = [];

      for (const resource of findresourse) {
        const response = await TimeSheet.find({Staff_Id: resource.staff_Id});

        if (!response || response.length === 0) {
          continue; // Skip if no data found for this resource
        }

        resultArray.push({
          totalHour: response.reduce(
            (sum, entry) => sum + Number(entry.hours),
            0
          ),
          billedhour: response.reduce(
            (sum, entry) => sum + entry.billed_hours,
            0
          ),
          resourceName: resource.FirstName,
        });
      }
      console.log(resultArray, "dafjsdkfj");

      if (resultArray.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Data Found");
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: resultArray,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  HoursByProject: asyncHandler(async (req, res) => {
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

      const findproject = await Project.find({
        CompanyId: checkcompany.Company_Id,
      });

      if (!findproject || findproject.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Project Found");
      }

      // Extract project IDs
      const projectIds = findproject.map((project) => project.ProjectId);

      const response = await TimeSheet.find({
        CompanyId: checkcompany.Company_Id,
        Project: {$in: projectIds}, // Match any of the found project IDs
      });

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Data Found");
      }

      // Aggregate data (sum up values from multiple records)
      const resultdata = response.reduce(
        (acc, entry) => {
          acc.billedhour += entry.billed_hours || 0;
          acc.totalHour += entry.hours || 0;
          acc.okhours += entry.ok_hours || 0;
          acc.blankHours += entry.blank_hours || 0;
          return acc;
        },
        {billedhour: 0, totalHour: 0, okhours: 0, blankHours: 0}
      );

      // Add project names
      resultdata.projectNames = findproject.map(
        (project) => project.Project_Name
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: resultdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   hour by company

  HourByCompany: asyncHandler(async (req, res) => {
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
      let queryObj = {};
      queryObj = {
        CompanyId: checkcompany.Company_Id,
      };

      const response = await TimeSheet.find(queryObj);
      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Data Found");
      }

      // Aggregate data (sum up values from multiple records)
      const resultdata = response.reduce(
        (acc, entry) => {
          acc.billedhour += entry.billed_hours || 0;
          acc.totalHour += entry.hours || 0;
          acc.okhours += entry.ok_hours || 0;
          acc.blankHours += entry.blank_hours || 0;
          return acc;
        },
        {billedhour: 0, totalHour: 0, okhours: 0, blankHours: 0}
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: resultdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),


};

module.exports = TimesheetSummaryCtr;
