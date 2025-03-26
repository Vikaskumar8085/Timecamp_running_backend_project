const asyncHandler = require("express-async-handler");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const moment = require("moment");
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
        .json({success: true, result: response});
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
        throw new Error("Unauthorized User. Please Sign Up");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      let {
        page = 1,
        limit = 10,
        search = "",
        start_date,
        end_date,
        status,
      } = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      let queryObj = {CompanyId: checkcompany.Company_Id};

      // Date Range Filter
      if (start_date || end_date) {
        queryObj.CreatedAt = {};
        if (start_date)
          queryObj.CreatedAt.$gte = moment(start_date, "DD/MM/YYYY")
            .startOf("day")
            .toDate();
        if (end_date)
          queryObj.CreatedAt.$lte = moment(end_date, "DD/MM/YYYY")
            .endOf("day")
            .toDate();
      }

      // Status Filter
      if (status) {
        queryObj.approval_status = status;
      }

      const totalTimesheets = await TimeSheet.countDocuments(queryObj);

      // Fetch paginated timesheets
      const response = await TimeSheet.find(queryObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No Timesheet Found");
      }

      const timesheetfetchdata = await Promise.all(
        response.map(async (item) => {
          const project = await Project.findOne({
            ProjectId: item.project,
          }).lean();
          const staff = await StaffMember.findOne({
            staff_Id: item.Staff_Id,
          }).lean();

          return {
            ProjectName: project ? project.Project_Name : "Unknown Project",
            StaffName: staff ? staff.FirstName : "Unknown Staff",
            ...item,
          };
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: timesheetfetchdata,
        totalPages: Math.ceil(totalTimesheets / limit),
        currentPage: page,
        totalTimesheets,
      });
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
        throw new Error("Unauthorized User. Please Sign Up.");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Extract query params
      let {search = "", page = 1, limit = 10} = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      let queryObj = {CompanyId: checkcompany.Company_Id};

      // Step 1: Find all projects with optional search filter
      let projectQuery = {
        ...queryObj,
        $or: [
          {Project_Name: {$regex: search, $options: "i"}}, // Case-insensitive search by name
          {Project_Code: {$regex: search, $options: "i"}}, // Case-insensitive search by code
        ],
      };

      const totalCount = await Project.countDocuments(projectQuery); // Get total count for pagination

      const projects = await Project.find(projectQuery)
        .skip((page - 1) * limit)
        .limit(limit);

      if (!projects || projects.length === 0) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "No projects found"});
      }

      // Extract project IDs
      const projectIds = projects.map((project) => project.ProjectId);

      // Step 2: Aggregate TimeSheet data for these projects
      const timesheetData = await TimeSheet.aggregate([
        {
          $match: {
            CompanyId: checkcompany.Company_Id,
            project: {$in: projectIds},
          },
        },
        {
          $group: {
            _id: "$project",
            totalHours: {$sum: {$toDouble: "$hours"}},
            okHours: {$sum: {$toDouble: "$ok_hours"}},
            billedHours: {$sum: {$toDouble: "$billed_hours"}},
            totalEntries: {$sum: 1}, // Count total entries for this project
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
        totalCount, // Total projects matching search filter
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        result,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  approved_timesheet: asyncHandler(async (req, res) => {
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
      // approved timesheet
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  disapproved_timesheet: asyncHandler(async (req, res) => {
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
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  billed_timesheet: asyncHandler(async (req, res) => {
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
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = TimesheetCtr;
