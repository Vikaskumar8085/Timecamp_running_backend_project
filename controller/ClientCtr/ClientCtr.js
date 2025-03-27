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
        throw new Error("Unauthorized User! Please Sign up.");
      }

      // Extract query parameters for pagination and search
      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      // Validate page and limit
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;

      // Query object to fetch projects for the client
      let queryObj = {
        clientId: user.Client_Id,
      };

      // Apply search filter if provided
      if (search.trim()) {
        queryObj.Project_Name = {$regex: search, $options: "i"}; // Search by Project Name (case-insensitive)
      }

      // Fetch total count of projects for pagination
      const totalProjects = await Project.countDocuments(queryObj);

      // Fetch paginated projects
      const projects = await Project.find(queryObj)
        .skip((page - 1) * limit) // Skip to the correct page
        .limit(limit) // Limit the number of projects per page
        .lean(); // Use lean to return plain JavaScript objects for better performance

      // If no projects are found
      if (projects.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No projects found.");
      }

      // Return the response with pagination details
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: projects,
        totalPages: Math.ceil(totalProjects / limit), // Calculate total pages
        currentPage: page, // Current page number
        totalProjects, // Total number of projects
      });
    } catch (error) {
      // Error handling with appropriate response
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      throw new Error(
        error?.message || "An error occurred while fetching client projects."
      );
    }
  }),

  //   Active Project
  fetchclientActiveProjects: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User. Please Sign up.");
      }

      // Extract query parameters for pagination and searching
      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page, 10); // Page number
      limit = parseInt(limit, 10); // Limit per page

      // Create a query object to fetch active projects
      let queryObj = {
        clientId: user.Client_Id,
        Project_Status: true, // Fetch only active projects
      };

      // Apply search filter (case-insensitive search for ProjectName)
      if (search) {
        queryObj.Project_Name = {$regex: search, $options: "i"}; // Search by project name
      }

      // Count total number of projects to calculate pagination
      const totalProjects = await Project.countDocuments(queryObj);

      // Fetch paginated active projects
      const response = await Project.find(queryObj)
        .skip((page - 1) * limit) // Skip based on the current page
        .limit(limit) // Limit number of records per page
        .lean()
        .exec();

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No active projects found");
      }

      // Return the results with pagination info
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        totalPages: Math.ceil(totalProjects / limit), // Calculate total number of pages
        currentPage: page, // Current page number
        totalProjects, // Total number of active projects
      });
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
        throw new Error("Un Authorized User. Please Sign up.");
      }

      // Extract query parameters for pagination and searching
      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page, 10); // Page number
      limit = parseInt(limit, 10); // Limit per page

      // Create a query object to fetch inactive projects
      let queryObj = {
        clientId: user.Client_Id,
        Project_Status: false, // Fetch only inactive projects
      };

      // Apply search filter (case-insensitive search for ProjectName)
      if (search.trim()) {
        queryObj.$or = [
          {Project_Name: {$regex: search, $options: "i"}}, // Search by project name
          {Project_Code: {$regex: search, $options: "i"}}, // Search by project code
        ];
      }
      // Count total number of projects to calculate pagination
      const totalProjects = await Project.countDocuments(queryObj);

      // Fetch paginated inactive projects
      const response = await Project.find(queryObj)
        .skip((page - 1) * limit) // Skip based on the current page
        .limit(limit) // Limit number of records per page
        .lean()
        .exec();

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No inactive projects found");
      }

      // Return the results with pagination info
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        totalPages: Math.ceil(totalProjects / limit), // Calculate total number of pages
        currentPage: page, // Current page number
        totalProjects, // Total number of inactive projects
      });
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

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Search & Filtering
      const search = req.query.search || "";
      const statusFilter = req.query.status || "";
      const priorityFilter = req.query.priority || "";

      let queryObj = {clientId: user?.Client_Id};

      // Find projects associated with the client
      const projects = await Project.find(queryObj);
      if (!projects.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Projects not found.");
      }

      const projectIds = projects.map((item) => item.ProjectId);

      // Task Query
      let taskQuery = {ProjectId: {$in: projectIds}};

      // Search by task name or description
      if (search) {
        taskQuery.$or = [
          {name: {$regex: search, $options: "i"}},
          {description: {$regex: search, $options: "i"}},
        ];
      }

      // Filtering
      if (statusFilter) {
        taskQuery.status = statusFilter;
      }
      if (priorityFilter) {
        taskQuery.priority = priorityFilter;
      }

      // Fetch Tasks with Pagination
      const tasks = await Task.find(taskQuery)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}); // Sort by newest

      const totalTasks = await Task.countDocuments(taskQuery);

      if (!tasks.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No tasks found.");
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: tasks,
        totalTasks,
        currentPage: page,
        totalPages: Math.ceil(totalTasks / limit),
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

  updateclientNotification: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch client project Time

  fetchclientprojectTime: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User, please Signup");
      }

      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      let queryObj = {
        clientId: user.Client_Id,
      };

      // Step 1: Find all projects for the given CompanyId with optional search
      const searchFilter = search
        ? {
            $or: [
              {Project_Name: {$regex: search, $options: "i"}},
              {Project_Code: {$regex: search, $options: "i"}},
            ],
          }
        : {};

      const projects = await Project.find({...queryObj, ...searchFilter})
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

      // Get total count for pagination
      const totalProjects = await Project.countDocuments({
        ...queryObj,
        ...searchFilter,
      });

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        totalPages: Math.ceil(totalProjects / limit),
        currentPage: page,
        totalProjects,
        result,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = ClientCtr;
//   const page = parseInt(req.query.page) || 1;
// const limit = parseInt(req.query.limit) || 10;
// const skip = (page - 1) * limit;

// // Search & Filtering
// const search = req.query.search || "";
// const statusFilter = req.query.status || "";
// const priorityFilter = req.query.priority || "";

// let queryObj = { clientId: user?.Client_Id };

// // Find projects associated with the client
// const projects = await Project.find(queryObj);
// if (!projects.length) {
//   return res.status(HttpStatusCodes.NOT_FOUND).json({
//     success: false,
//     message: "Projects not found."
//   });
// }

// const projectIds = projects.map((item) => item.ProjectId);

// // Aggregation pipeline
// const pipeline = [
//   {
//     $match: { ProjectId: { $in: projectIds } }
//   },
//   {
//     $lookup: {
//       from: "milestones",
//       localField: "MilestoneId",
//       foreignField: "MilestoneId",
//       as: "milestone"
//     }
//   },
//   {
//     $lookup: {
//       from: "staffmembers",
//       localField: "AssignedTo",
//       foreignField: "staff_id",
//       as: "staffMember"
//     }
//   },
//   {
//     $lookup: {
//       from: "clients",
//       localField: "ClientId",
//       foreignField: "Client_Id",
//       as: "client"
//     }
//   },
//   {
//     $unwind: { path: "$milestone", preserveNullAndEmptyArrays: true }
//   },
//   {
//     $unwind: { path: "$staffMember", preserveNullAndEmptyArrays: true }
//   },
//   {
//     $unwind: { path: "$client", preserveNullAndEmptyArrays: true }
//   },
//   {
//     $match: {
//       ...(search && {
//         $or: [
//           { name: { $regex: search, $options: "i" } },
//           { description: { $regex: search, $options: "i" } }
//         ]
//       }),
//       ...(statusFilter && { status: statusFilter }),
//       ...(priorityFilter && { priority: priorityFilter })
//     }
//   },
//   {
//     $sort: { createdAt: -1 }
//   },
//   {
//     $skip: skip
//   },
//   {
//     $limit: limit
//   },
//   {
//     $project: {
//       name: 1,
//       description: 1,
//       status: 1,
//       priority: 1,
//       createdAt: 1,
//       "milestone.name": 1,
//       "staffMember.FirstName": 1,
//       "client.ClientName": 1
//     }
//   }
// ];

// const tasks = await Task.aggregate(pipeline);
// const totalTasks = await Task.countDocuments({ ProjectId: { $in: projectIds } });

// return res.status(HttpStatusCodes.OK).json({
//   success: true,
//   result: tasks,
//   totalTasks,
//   currentPage: page,
//   totalPages: Math.ceil(totalTasks / limit)
// });
