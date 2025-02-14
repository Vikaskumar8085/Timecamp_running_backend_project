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

      const checkcompany = await Company.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      const findresourse = await StaffMember.find({
        CompanyId: checkcompany.Company_Id,
      });
      if (!findresourse) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("not Found resources");
      }
      let queryObj = {};
      queryObj = { Staff_Id: findresourse.staff_Id };

      const response = await TimeSheet.find(queryObj);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Data Found");
      }

      const resultdata = {
        totalHour: response.hours,
        billedhour: response.billed_hours,
        resourseName: findresourse.FirstName,
      };

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message:"timesheet data",
        result: resultdata,
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

      const checkcompany = await Company.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const findproject = await Project.find({
        CompanyId: checkcompany.Company_Id,
      });

      if (!findproject) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Project Found");
      }

      let queryObj = {};
      queryObj = {
        CompanyId: checkcompany.Company_Id,
        Project: findproject.ProjectId,
      };

      const response = await TimeSheet.find(queryObj);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Data Found");
      }
      const resultdata = {
        billedhour: response.billed_hours,
        projectName: findproject.Project_Name,
      };

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

      const checkcompany = await Company.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      let queryObj = {};
      queryObj = {
        CompanyId: checkcompany.Company_Id,
      };

      const response = await TimeSheet.find(queryObj);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Data Found");
      }
      const resultdata = {
        billedhour: response.billed_hours,
        totalHour: response.hours,
        okhours: response.ok_hours,
        blankHours: response.blank_hours,
      };

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: resultdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  ProjectTimeUtilization: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new error(error?.message);
    }
  }),
};

module.exports = TimesheetSummaryCtr;
