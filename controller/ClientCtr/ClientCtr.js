const asyncHandler = require("express-async-handler");
const Client = require("../../models/AuthModels/Client/Client");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const Task = require("../../models/Othermodels/Task/Task");

const ClientCtr = {
  fetchClientprojects: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user).lean().exec();
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User !Please Sign up");
      }

      let queryObj = {};

      queryObj = {
        clientId: user.Client_Id,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Not Found ");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchclientprojectTask: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }
      //   const
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   fetch client active projects
  fetchclientActiveProjects: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }

      let queryObj = {};

      queryObj = {
        clientId: user.Client_Id,
        Project_Status: true,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not Found");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchclientInactiveprojects: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }

      let queryObj = {};

      queryObj = {
        clientId: user.Client_Id,
        Project_Status: false,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Not Found ");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchclientsingleproject: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({success: false, message: "Unauthorized User, please Signup"});
      }

      // Query object for finding projects
      const queryObj = {
        clientId: user.Client_Id,
        ProjectId: req.params.id,
      };

      // Find projects
      const findProject = await Project.find(queryObj);
      if (!findProject || findProject.length === 0) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({success: false, message: "Project Not Found"});
      }

      // Pagination setup for timesheets
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Fetch project data with timesheets
      const projectData = await Promise.all(
        findProject.map(async (item) => {
          const findtimesheet = await TimeSheet.find({project: item.ProjectId})
            .skip(skip)
            .limit(limit);

          // const findresources = await

          return {...item.toObject(), timesheets: findtimesheet};
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: projectData, page, limit});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // ProjectId

  fetchclientprojecttask: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }

      let queryObj = {};
      queryObj = {
        clientId: user?.Client_Id,
        ProjectId: req.params.id,
      };
      const findProject = await Project.find(queryObj);

      if (!findProject || findProject.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not Found");
      }

      const projecttask = Promise.all((projects) => {
        projects.map(async (item) => {
          let fetchtasks = await Task.find({
            ProjectId: item.ProjectId,
          });
          return {...projects, fetchtasks};
        });
      });

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: projecttask});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = ClientCtr;
