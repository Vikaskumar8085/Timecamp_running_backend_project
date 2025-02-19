const asyncHandler = require("express-async-handler");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");

const ContractorCtr = {
  fetchcontractorprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized User ! Please Signup");
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

      const contractorProjects = await Project.find({ProjectId: rrid});

      const allProjects = {response, contractorProjects};
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: allProjects});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchContractorActiveProjects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

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

      const contractoractiveProjects = await Project.find({
        ProjectId: rrid,
        Project_Status: true,
      });

      const activeprojects = {response, contractoractiveProjects};

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: activeprojects});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchContractorInactiveProjects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
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

      const contractorinactiveProjects = await Project.find({
        ProjectId: rrid,
        Project_Status: false,
      });

      const inactiveprojects = {response, contractorinactiveProjects};

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: inactiveprojects});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  FillContractorProjectTimesheet: asyncHandler(async (req, res) => {
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

  // fetch contractor project Timesheet
  fetchContractorProjectTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      // let queryObj = {};
      // queryObj = {
      //   Projectid: user.staff_Id,
      // };

      // const response = await RoleResource.find(queryObj).lean().exec();
      // if (!response) {
      //   res.status(HttpStatusCodes.NOT_FOUND);
      //   throw new Error("Employee Not Found");
      // }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchContractorProjectTask: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchcontractortimesheetproject: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  getcontractortimesheet: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  getcontractortasks: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = ContractorCtr;
