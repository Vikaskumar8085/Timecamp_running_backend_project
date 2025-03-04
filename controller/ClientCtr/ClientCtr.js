const asyncHandler = require("express-async-handler");
const Client = require("../../models/AuthModels/Client/Client");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const Task = require("../../models/Othermodels/Task/Task");
const moment = require("moment");
const Notification = require("../../models/Othermodels/Notification/Notification");
const ClientCtr = {
  // Client Project
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
  //   Active Project
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
  // InActive Project
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
  // Timesheet
  fetchclientprojectTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User, please Signup",
        });
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
          const findtimesheet = await TimeSheet.find({
            project: item.ProjectId,
          })
            .skip(skip)
            .limit(limit);

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

  // Task
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

      const projecttask = await Promise.all(
        findProject.map(async (item) => {
          let fetchtasks = await Task.find({
            ProjectId: item.ProjectId,
          });

          return {
            ...item.toObject(),
            fetchtasks,
          };
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: projecttask,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // Single Project
  fetchclientSingleproject: asyncHandler(async (req, res) => {
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

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: findProject,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch client task

  fetchClientTask: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }

      let queryObj = {};
      queryObj = {
        clientId: user?.Client_Id,
      };
      const findProject = await Project.find(queryObj);

      if (!findProject?.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not found");
      }

      const projectids = findProject.map((item) => item.ProjectId);
      const projecttask = await Task.find({ProjectId: {$in: projectids}});
      if (!projecttask?.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Task Not Found");
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: projecttask,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchClientTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }
      let queryObj = {};
      queryObj = {
        clientId: user?.Client_Id,
      };

      const findProject = await Project.find(queryObj);

      console.log(findProject);
      if (!findProject?.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not found");
      }

      const projectids = findProject.map((item) => item.ProjectId);
      const projectTimesheet = await TimeSheet.find({
        project: {$in: projectids},
      });
      if (!projectTimesheet?.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Timesheet Not Found");
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: projectTimesheet,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // update client
  approvetimesheet: asyncHandler(async (req, res) => {
    try {
      console.log(req.body, req.params.id, "approv timesheet ???????");
      const approveIds = req.body;
      const user = await Client.findById(req.user);

      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED).send({
          message: "Unauthorized User, please Sign up",
        });
        throw new Error("Unauthorized User, please Sign up");
      }

      const findTimesheet = await TimeSheet.findOne({
        project: req.params.id,
      });

      if (!findTimesheet) {
        res.status(HttpStatusCodes.NOT_FOUND).send({
          message: "Timesheet Not Found",
        });
        throw new Error("Timesheet Not Found");
      }

      // Using async/await with Promise.all to ensure all updates are completed
      try {
        await Promise.all(
          approveIds.map(async (item) => {
            // Find the specific Timesheet by Timesheet_Id
            const timesheet = await TimeSheet.findOne({Timesheet_Id: item});

            // Check if the timesheet exists and if the status is "PENDING"
            if (!timesheet) {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(`Timesheet with Timesheet_Id ${item} not found.`);
            }

            if (timesheet.approval_status !== "PENDING") {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(
                `Timesheet cannot be approved because it's not in 'PENDING' status.`
              );
            }

            // Proceed with the update if it's 'PENDING'
            const updatedTimesheet = await TimeSheet.findOneAndUpdate(
              {Timesheet_Id: item},
              {
                $set: {
                  approval_status: "APPROVED",
                  approved_by: user.Client_Id,
                  approved_date: moment().format("DD/MM/YYYY"),
                },
              },
              {new: true, runValidators: true}
            );

            if (!updatedTimesheet) {
              res.status(HttpStatusCodes.BAD_REQUEST);
              throw new Error(
                `Timesheet with Timesheet_Id ${item} was not updated successfully.`
              );
            }
          })
        );

        res.status(HttpStatusCodes.OK).json({
          success: true,
          message: "Timesheets  successfully updated.",
        });
      } catch (error) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        throw new Error("An error occurred while updating timesheets.");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  disapprovetimesheet: asyncHandler(async (req, res) => {
    try {
      console.log(req.body, req.params.id, "approv timesheet ???????");
      const approveIds = req.body;
      const user = await Client.findById(req.user);

      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED).send({
          message: "Unauthorized User, please Sign up",
        });
        throw new Error("Unauthorized User, please Sign up");
      }

      const findTimesheet = await TimeSheet.findOne({
        project: req.params.id,
      });

      if (!findTimesheet) {
        res.status(HttpStatusCodes.NOT_FOUND).send({
          message: "Timesheet Not Found",
        });
        throw new Error("Timesheet Not Found");
      }

      // Using async/await with Promise.all to ensure all updates are completed
      try {
        await Promise.all(
          approveIds.map(async (item) => {
            // Find the specific Timesheet by Timesheet_Id
            const timesheet = await TimeSheet.findOne({Timesheet_Id: item});

            // Check if the timesheet exists and if the status is "PENDING"
            if (!timesheet) {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(`Timesheet with Timesheet_Id ${item} not found.`);
            }

            if (timesheet.approval_status !== "PENDING") {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(
                `Timesheet cannot be approved because it's not in 'PENDING' status.`
              );
            }

            // Proceed with the update if it's 'PENDING'
            const updatedTimesheet = await TimeSheet.findOneAndUpdate(
              {Timesheet_Id: item},
              {
                $set: {
                  approval_status: "DISAPPROVED",
                  approved_by: user.Client_Id,
                  approved_date: moment().format("DD/MM/YYYY"),
                },
              },
              {new: true, runValidators: true}
            );

            if (!updatedTimesheet) {
              res.status(HttpStatusCodes.BAD_REQUEST);
              throw new Error(
                `Timesheet with Timesheet_Id ${item} was not updated successfully.`
              );
            }
          })
        );

        res.status(HttpStatusCodes.OK).send({
          message: "Timesheets Disapproved successfully updated.",
        });
      } catch (error) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        throw new Error("An error occurred while updating timesheets.");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchClientNotification: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }
      const response = await Notification.find({
        ReciverId: user?.staff_Id,
      }).sort({createdAt: -1});
      if (!response) {
        res.status(HttpStatusCodes?.NOT_FOUND);
        throw new Error("Client Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  updateclientNotification:asyncHandler(async(req,res)=>{
    try {
      
    } catch (error) {
      throw new Error(error?.message)
    }
  })
};

module.exports = ClientCtr;
