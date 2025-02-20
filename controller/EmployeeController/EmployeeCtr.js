const asyncHandler = require("express-async-handler");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const Timesheet = require("../../models/Othermodels/Timesheet/Timesheet");
const Task = require("../../models/Othermodels/Task/Task");

const EmployeeCtr = {
  fetchemployeeprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      let queryObj = {};
      queryObj = {
        Project_ManagersId: user.staff_Id,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }

      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = await responseResult.map((item) => item.ProjectId);

      const employeeProjects = await Project.find({ProjectId: rrid});

      const allProjects = {response, employeeProjects};
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: allProjects});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchemployeeActiveProjects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      let queryObj = {};

      queryObj = {
        Project_ManagersId: user.staff_Id,
        Project_Status: true,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = await responseResult.map((item) => item.ProjectId);

      const employeeactiveProjects = await Project.find({
        ProjectId: rrid,
        Project_Status: true,
      });

      const activeprojects = {response, employeeactiveProjects};

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: activeprojects});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchemployeeInactiveProjects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      let queryObj = {};

      queryObj = {
        Project_ManagersId: user.staff_Id,
        Project_Status: false,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = await responseResult.map((item) => item.ProjectId);

      const employeeinactiveProjects = await Project.find({
        ProjectId: rrid,
        Project_Status: false,
      });

      const inactiveprojects = {response, employeeinactiveProjects};

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: inactiveprojects});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fill timesheet by employee

  FillEmployeeProjectTimesheet: asyncHandler(async (req, res) => {
    try {
      const newdata = req.body;

      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      let attachmentPath = req.file ? req.file.filename : Attachment;
      const inputdata = [];
      for (let item of newdata) {
        const Timesheetdata = new Timesheet({
          Staff_Id: user.staff_Id,
          hours: item.hours,
          project: item.Projectid,
          day: item.day,
          Description: item.Description,
          task_description: item.task_description,
          attachement: attachmentPath,
        });
        const saveTimesheetdata = await Timesheetdata.save();
        inputdata.push(saveTimesheetdata);
      }

      return res.status(HttpStatusCodes.CREATED).json({
        message: "Timesheet Filled Successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  getemployeesingleporjectTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      let queryObj = {};
      queryObj = {
        ProjectId: req.params.id,
      };

      const response = await Project.find(queryObj);
      if (!response && response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("project Not Found");
      }

      const projectDetails = await Promise.all(
        response.map(async (item) => {
          const findtimesheet = await TimeSheet.find({
            project: item.ProjectId,
          });

          const result = {
            findtimesheet,
          };

          return result;
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: projectDetails});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  getemployeesingleporjectTask: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      let queryObj = {};
      queryObj = {
        ProjectId: req.params.id,
      };

      const response = await Project.find(queryObj);
      if (!response && response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("project Not Found");
      }

      const taskDetails = await Promise.all(
        response.map(async (item) => {
          const findTasks = await Task.find({
            ProjectId: item.ProjectId,
          });
          const result = {
            findTasks,
          };
          return result;
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: taskDetails});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  getemployeesingleprojectinformation: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      let queryObj = {};
      queryObj = {
        ProjectId: req.params.id,
      };

      const response = await Project.find(queryObj);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not Found");
      }

      const projectDetails = await Promise.all(
        response.map(async (item) => {
          const manager = await StaffMember.findOne({
            staff_Id: item.Project_ManagersId,
          });

          const findRRid = await RoleResource.findOne({
            ProjectId: item.ProjectId,
          });

          // Ensure findRRid exists before trying to extract RRId
          const rrids = findRRid ? [findRRid.RRId] : [];

          // Find all team members based on rrids
          const findTeamName = await StaffMember.find({staff_Id: {$in: rrids}});

          return {
            ...item.toObject(),
            Manager_Name: manager ? manager.FirstName : null, // Handle null case
            Team:
              findTeamName.length > 0
                ? findTeamName.map((member) => member.FirstName)
                : [],
          };
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: projectDetails,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  getEmployeeTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

    



    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  getEmployeetasks: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const response = await Project.find({});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = EmployeeCtr;
