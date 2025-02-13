const asyncHandler = require("express-async-handler");
const Client = require("../../models/AuthModels/Client/Client");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");

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
};

module.exports = ClientCtr;
