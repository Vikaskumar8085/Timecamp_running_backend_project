const asyncHandler = require("express-async-handler");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const Task = require("../../models/Othermodels/Task/Task");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Roles = require("../../models/MasterModels/Roles/Roles");
const Client = require("../../models/AuthModels/Client/Client");
const Notification = require("../../models/Othermodels/Notification/Notification");
const moment = require("moment");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
const path = require("path");
const Bucket = require("../../models/Othermodels/Bucket/Bucket");
const Designation = require("../../models/MasterModels/Designation/Designation");
const EmployeeCtr = {
  fetchemployeeprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Signup.");
      }

      // Pagination and search query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";

      const skip = (page - 1) * limit;
      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = responseResult.map((item) => item.ProjectId);
      console.log(rrid, "rrids");

      // Base query
      let queryObj = {};

      queryObj = {
        $or: [{ProjectId: {$in: rrid}}, {createdBy: {$in: user.staff_Id}}],
      };

      // Add search filter if present
      // if (search) {
      //   queryObj = {
      //     $and: [
      //       queryObj,
      //       {
      //         $or: [
      //           { Project_Name: { $regex: search, $options: "i" } },
      //           { description: { $regex: search, $options: "i" } }, // optional: add other searchable fields
      //         ],
      //       },
      //     ],
      //   };
      // }

      // Fetch projects
      const response = await Project.find(queryObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const totalManaged = await Project.countDocuments(queryObj);

      // Fetch employee projects
      // const responseResult = await RoleResource.find({RRId: user.staff_Id});
      // const rrid = responseResult.map((item) => item.ProjectId);

      // const employeeQuery = {
      //   ProjectId: {$in: rrid},
      // };

      // // Add search to employee projects too
      // if (search) {
      //   employeeQuery.$and = [
      //     {
      //       $or: [
      //         {name: {$regex: search, $options: "i"}},
      //         {description: {$regex: search, $options: "i"}},
      //       ],
      //     },
      //   ];
      // }

      // const employeeProjects = await Project.find(employeeQuery)
      //   .skip(skip)
      //   .limit(limit)
      //   .lean()
      //   .exec();

      // const result = {...employeeProjects, ...response};
      // const totalEmployee = await Project.countDocuments(employeeQuery);

      // const allProjects = {
      //   result: response,

      //   pagination: {
      //     currentPage: page,
      //     limit,
      //     totalManaged,
      //     totalEmployee,
      //   },
      // };

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        // pagination: {
        //   currentPage: page,
        //   limit,
        //   totalManaged,
        //   totalEmployee,
        // },
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }),

  fetchemployeeActiveProjects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Sign Up.",
        });
      }

      const {page = 1, limit = 10, search = ""} = req.query;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const skip = (pageNumber - 1) * limitNumber;

      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = responseResult.map((item) => item.ProjectId);

      let queryObj = {
        ProjectId: {$in: rrid},
        Project_Status: true,
      };

      // Add search condition if present
      if (search) {
        queryObj.Project_Name = {$regex: search, $options: "i"}; // Case-insensitive search
      }

      // const totalProjects = await Project.countDocuments(queryObj);

      const projects = await Project.find(queryObj)
        .skip(skip)
        .limit(limitNumber)
        .lean()
        .exec();

      if (!projects.length) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "No active projects found",
        });
      }

      // const responseResult = await RoleResource.find({RRId: user.staff_Id});
      // const rrid = responseResult.map((item) => item.ProjectId);

      // let employeeactiveProjects = [];
      // if (rrid.length > 0) {
      //   const employeeQuery = {
      //     ProjectId: {$in: rrid},
      //     Project_Status: true,
      //   };

      //   if (search) {
      //     employeeQuery.Project_Name = {$regex: search, $options: "i"};
      //   }

      //   employeeactiveProjects = await Project.find(employeeQuery)
      //     .skip(skip)
      //     .limit(limitNumber);
      // }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: projects,

        // pagination: {
        //   totalProjects,
        //   totalPages: Math.ceil(totalProjects / limitNumber),
        //   currentPage: pageNumber,
        //   limit: limitNumber,
        // },
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchemployeeInactiveProjects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized User Please Sign Up");
      }

      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = responseResult.map((item) => item.ProjectId);

      let queryObj = {
        ProjectId: {$in: rrid},
        Project_Status: false,
      };

      const totalProjects = await Project.countDocuments(queryObj);
      const response = await Project.find(queryObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }

      // const responseResult = await RoleResource.find({RRId: user.staff_Id});
      // const rrid = responseResult.map((item) => item.ProjectId);

      // const employeeInactiveProjects = await Project.find({
      //   ProjectId: {$in: rrid},
      //   Project_Status: false,
      //   Project_Name: {$regex: search, $options: "i"},
      // })
      //   .skip((page - 1) * limit)
      //   .limit(limit);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        // result: {
        //   response,
        //   employeeInactiveProjects,
        //   pagination: {
        //     totalProjects,
        //     totalPages: Math.ceil(totalProjects / limit),
        //     currentPage: page,
        //   },
        // },
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fill timesheet by employee

  FillEmployeeProjectTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      if (req.file) {
        let attachmentPath = req.file ? req.file.filename : null;
        let uploadPath = "uploads/";

        // Get file extension
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        console.log(fileExt, "reqogsdfisdfl");

        // Define subfolders based on file type
        if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
          uploadPath += "documents/";
        } else if (
          [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)
        ) {
          uploadPath += "images/";
        } else if (file.mimetype === "text/csv") {
          uploadPath += "csv/";
        } else {
          uploadPath += "others/"; // Fallback folder
        }

        // console.log(uploadPath, "upload path");

        var attachement = attachmentPath
          ? `${req.protocol}://${req.get(
              "host"
            )}/${uploadPath}/${attachmentPath}`
          : null;
      }
      const response = new TimeSheet({
        // CompanyId: user?.CompanyId,
        Staff_Id: user?.staff_Id,
        attachement: attachement,
        ...req.body,
      });
      console.log(req.body);

      await response.save();

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
        project: parseInt(req.params.id),
      };

      const response = await TimeSheet.find(queryObj);
      if (!response && response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("project Not Found");
      }

      // const projectDetails = await Promise.all(
      //   response.map(async (item) => {
      //     const findtimesheet = await TimeSheet.find({
      //       project: item.ProjectId,
      //     });

      //     const result = {
      //       findtimesheet,
      //     };

      //     return result;
      //   })
      // );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
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
        ProjectId: parseInt(req.params.id),
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
          const findTeamName = await StaffMember.find({
            staff_Id: {$in: rrids},
          });

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
        throw new Error("UnAuthorized User, Please Signup");
      }
      console.log(user, "user");

      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      const query = {Staff_Id: user.staff_Id};

      if (search) {
        query.$or = [
          {task_description: {$regex: search, $options: "i"}}, // Case-insensitive search in task description
          {Description: {$regex: search, $options: "i"}}, // Case-insensitive search in description
        ];
      }

      const fetchTimesheet = await TimeSheet.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      const totalRecords = await TimeSheet.countDocuments(query);
      return res.status(HttpStatusCodes.OK).json({
        result: fetchTimesheet,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
        success: true,
      });
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
      // Get pagination and search parameters from the request query
      const {page = 1, limit = 10, search = ""} = req.query;
      const skip = (page - 1) * limit;

      // Create search filter
      const searchFilter = {
        Resource_Id: {$in: user.staff_Id}, // Always filter by the current user's staffId
      };

      // Apply search if the user provided a search term
      if (search) {
        searchFilter.$or = [{Task_Name: {$regex: search, $options: "i"}}];
      }

      // Fetch tasks from the database with pagination and search filter
      const gettaskresponse = await Task.find(searchFilter)
        .skip(skip)
        .limit(Number(limit));
      console.log(gettaskresponse, "resosdflk");

      if (!gettaskresponse || gettaskresponse.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No tasks found for this user");
      }

      // Fetch total count of tasks for pagination
      const totalTasks = await Task.countDocuments(searchFilter);

      // Fetch additional data (milestones, resources, projects) for each task
      const response = await Promise.all(
        gettaskresponse.map(async (item) => {
          // Fetch the milestone details for the current task
          console.log(item, "task info");
          const fetchmilestone = await Milestone.find({
            Milestone_id: {$in: item.MilestoneId},
          });

          // Fetch the resource (staff) details for the task
          const fetchresourcename = await StaffMember.find({
            staff_Id: {$in: item.Resource_Id},
          });

          // Fetch the project name associated with the task
          const projectname = await Project.find({
            ProjectId: {$in: item.ProjectId},
          });

          // Map milestone names
          const milestoneNames = fetchmilestone.map(
            (milestone) => milestone.Name
          );

          // Map resource first names
          const resourceNames = fetchresourcename.map(
            (staff) => staff.FirstName
          );

          // Map project names
          const projectNames = projectname.map(
            (project) => project.Project_Name
          );

          // Combine all the data into the result object
          const result = {
            ...item._doc, // Include task details (item data)
            milestones: milestoneNames, // Add milestone data
            resources: resourceNames, // Add resource data (staff member details)
            project: projectNames, // Add project details
          };

          return result;
        })
      );

      // Calculate total pages based on total tasks and current page size
      const totalPages = Math.ceil(totalTasks / limit);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalTasks,
        },
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  removeEmployeeTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const response = await TimeSheet.findOne({
        Timesheet_Id: parseInt(req.params.id),
      });
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("TimeSheet NOT FOUND");
      } else {
        if (response?.approval_status === null) {
          await response.deleteOne();
        } else {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error(
            "You can not delete this timesheet it's alerady send to team lead"
          );
        }
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "Timesheet Remove Successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  SendForApprovel: asyncHandler(async (req, res) => {
    try {
      var approveIds = req.body;

      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const findTimesheet = await TimeSheet.find({
        project: req.params.id,
      });

      if (!findTimesheet) {
        res.status(HttpStatusCodes.NOT_FOUND).send({
          message: "Timesheet Not Found",
        });
        throw new Error("Timesheet Not Found");
      }
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

            // Proceed with the update if it's 'PENDING'
            const updatedTimesheet = await TimeSheet.findOneAndUpdate(
              {Timesheet_Id: item},
              {
                $set: {
                  approval_status: "PENDING",
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

  createEmployeeProject: asyncHandler(async (req, res) => {
    try {
      const {
        Project_Name,
        clientId,
        Project_Type,
        Project_Hours,
        currency,
        Start_Date,
        End_Date,
        bucket,
        roleResources,
        roleProjectMangare,
      } = req.body;

      var user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const checkcompany = await Company({Company_Id: user?.CompanyId});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not Found");
      }

      const createproject = new Project({
        CompanyId: checkcompany.Company_Id,
        Project_Name,
        clientId,
        Project_Type,
        Project_Hours,
        Project_Status: true,
        currency,
        Start_Date: moment(Start_Date).format("DD/MM/YYYY"),
        End_Date: moment(End_Date).format("DD/MM/YYYY"),
        createdBy: user?.staff_Id,
        ...req.body,
      });
      if (!createproject) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Project Not Found");
      }

      await createproject.save();
      // Bucket add
      if (Project_Type !== "Bucket" && bucket.length === 0) {
        return;
      } else {
        if (!Array.isArray(bucket) || bucket.length === 0) {
          return res.status(400).json({
            message: "Milestones data is required and should be an array.",
          });
        }
        let insertedMilestones = [];
        for (const item of bucket) {
          const bucket = new Bucket({
            ProjectId: createproject.ProjectId,
            bucketHourly: item.bucketHourly,
            bucketHourlyRate: item.bucketHourlyRate,
          });

          const savedbucket = await bucket.save();
          insertedMilestones.push(savedbucket);
        }
      }
      // Bucket add
      // modified client data
      let responseClientId = createproject.clientId;

      if (!responseClientId) {
        return; // Exit early if clientId is not available
      }

      const client = await Client.findOne({Client_Id: responseClientId});
      if (!client) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error(`Client with ID ${responseClientId} not found.`);
      }

      if (client.Client_Status !== "Active") {
        await Client.updateOne(
          {Client_Id: responseClientId},
          {$set: {Client_Status: "Active"}}
        );
      }

      // Optionally log or notify about t
      await new Notification({
        SenderId: user?.staff_Id,
        ReciverId: responseClientId,
        Pic: user?.Photos[0],
        Name: user?.FirstName,
        Description: `You have been assigned to the ${Project_Name} project as a new client.`,
        IsRead: false,
      }).save();

      // Proceed to create the notification regardless

      //  update add Project manager role
      const projectId = createproject?.ProjectId;

      // role resource id add fucntionality
      if (!Array.isArray(roleResources) || roleResources.length === 0) return;

      for (let roleitem of roleResources) {
        await new RoleResource({
          RRId: roleitem?.RRId,
          RId: roleitem?.RId,
          ProjectId: projectId,
          Rate: roleitem?.Rate,
          Unit: roleitem?.Unit,
          Engagement_Ratio: roleitem?.Engagement_Ratio,
        }).save();
      }

      try {
        let updatestaffmember = await Promise.all(
          (roleResources || []).map(async ({RRId, RId}) => {
            if (!RRId) return; // Skip invalid entries
            const staff = await StaffMember.findOne({staff_Id: RRId});

            if (!staff) {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(`Staff with ID ${RRId} not found.`);
            }

            if (staff.IsActive !== "Active") {
              await StaffMember.updateOne(
                {staff_Id: RRId},
                {$set: {IsActive: "Active"}}
              );
            }
            // send notification as Employee Roles
            await Notification({
              SenderId: user?.staff_Id,
              ReciverId: RRId, // Receiver is RRId
              Name: user?.FirstName,
              Pic: user?.Photos[0],
              Description: `${staff?.FirstName}, you have been assigned to the ${Project_Name} project as a employee.`,
              IsRead: false,
            }).save();
          })
        );

        if (!updatestaffmember) {
          res.status(HttpStatusCodes.NOT_FOUND);
          throw new Error("staff Not found");
        }
      } catch (error) {
        console.error("Error updating staff members:", error);
      }

      // role resource id add fucntionality
      // // roleProjectMangare
      if (!Array.isArray(roleProjectMangare) || roleProjectMangare.length == 0)
        return;
      let insertProjectManagerdata = [];
      for (let item of roleProjectMangare) {
        const responseitem = new RoleResource({
          RRId: item?.RRId,
          RId: item?.RId,
          ProjectId: projectId,
          Rate: item?.Rate,
          Unit: item?.Unit,
          Engagement_Ratio: item?.Engagement_Ratio,
        });
        let data = await responseitem.save();
        insertProjectManagerdata.push(data);
      }
      try {
        let updatestaffmember = await Promise.all(
          (roleProjectMangare || []).map(async ({RRId, RId}) => {
            if (!RRId) return;

            const staff = await StaffMember.findOne({staff_Id: RRId});

            if (!staff) {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(`Staff with ID ${RRId} not found.`);
            }

            if (staff.IsActive !== "Active") {
              await StaffMember.updateOne(
                {staff_Id: RRId},
                {$set: {IsActive: "Active"}}
              );
            }

            // Send notification
            await Notification({
              SenderId: user?.staff_Id,
              ReciverId: RRId, // Receiver is RRId
              Name: user?.FirstName,
              Pic: user?.Photos[0],
              Description: `${staff?.FirstName}, you have been assigned to the ${Project_Name} project as a Project Manager.`,
              IsRead: false,
            }).save();
          })
        );

        if (!updatestaffmember) {
          res.status(HttpStatusCodes.NOT_FOUND);
          throw new Error("staff Not found");
        }
        //  update add Project manager role
      } catch (error) {
        console.error("Error updating staff members:", error);
      }

      return res
        .status(HttpStatusCodes.CREATED)
        .json({success: true, message: "Project Created Successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch company
  fetchemployeeRole: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const checkcompany = await Company({Company_Id: user?.CompanyId});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not Found");
      }

      const fetchRoles = await Roles.find({
        CompanyId: {$in: checkcompany?.Company_Id},
      });

      if (!fetchRoles) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Role Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: fetchRoles});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch clients

  fetchclients: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const checkcompany = await Company({Company_Id: user?.CompanyId});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not Found");
      }

      const response = await Client?.find({
        Common_Id: checkcompany?.Company_Id,
      });
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
  // fetch staff memeber
  fetchstaffmember: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const checkcompany = await Company({Company_Id: user?.CompanyId});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not Found");
      }
      const response = await StaffMember.find({
        CompanyId: checkcompany?.Company_Id,
      });
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Staff Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchEmployeeNotificationMessage: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const response = await Notification.find({
        ReciverId: user?.staff_Id,
        IsRead: false,
      }).sort({createdAt: -1});

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Employee Notficaiton Not Found");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({result: response, success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchemployeeproject_time: asyncHandler(async (req, res) => {
    try {
      // Fetch the currently authenticated user
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized User Please Signup ");
      }

      // Ensure that the user is a Employee
      const Employeedata = await StaffMember.findOne({
        staff_Id: user?.staff_Id,
        Role: "Employee", // Filter only Employees
      });

      if (!Employeedata) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Employee not found",
        });
      }

      // Get search, page, and limit from query parameters
      let {search, page = 1, limit = 10} = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      // Build the query object to fetch projects for the Employee
      const queryObj = {
        $or: [
          {createdBy: Employeedata?.staff_Id},
          {Project_ManagersId: Employeedata?.staff_Id},
          {
            ProjectId: {
              $in: await RoleResource.find({
                RRId: Employeedata?.staff_Id,
              }).then((res) => res.map((item) => item.ProjectId)),
            },
          },
        ],
      };

      // If a search term is provided, filter projects by Project_Name
      if (search) {
        queryObj.Project_Name = {$regex: search, $options: "i"};
      }

      // Step 1: Get projects based on the query and pagination
      const totalProjects = await Project.countDocuments(queryObj);
      const projects = await Project.find(queryObj).skip(skip).limit(limit);

      if (!projects || projects.length === 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "No projects found",
        });
      }

      // Step 2: Aggregate timesheet data for these projects
      const timesheetData = await TimeSheet.aggregate([
        {
          $match: {
            project: {$in: projects.map((project) => project.ProjectId)},
          },
        },
        {
          $group: {
            _id: "$project",
            totalHours: {$sum: {$toDouble: "$hours"}},
            okHours: {$sum: {$toDouble: "$ok_hours"}},
            billedHours: {$sum: {$toDouble: "$billed_hours"}},
            totalEntries: {$sum: 1}, // Count total timesheet entries per project
          },
        },
      ]);

      // Step 3: Map timesheet data back to the projects
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

      // Step 4: Return the projects and pagination data
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result,
        pagination: {
          total: totalProjects,
          page,
          limit,
          totalPages: Math.ceil(totalProjects / limit),
        },
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch employee milestones
  fetchemployeemilestones: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup.",
        });
      }

      const fetchproject = await Milestone.find({
        ProjectId: parseInt(req.params.id),
      });

      if (!fetchproject) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Mile stone not found");
      }
      res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: fetchproject});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // add task progress
  addtaskprogress: asyncHandler(async (req, res) => {
    try {
      console.log("employee", req.body);
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup.",
        });
      }

      // fill timesheet
      const response = await TimeSheet.findOneAndUpdate(
        {
          project: req.body.project,
        },
        {
          $set: {
            Description: req.body.task_Description,
            hours: req.body.hours,
            day: moment().format("DD/MM/YYYY"),
          },
        }, // 🔹 Update document with new values
        {new: true, upsert: true} // 🔹 Return updated doc, create if not found
      );

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Timesheet Not found");
      } else {
        await Task.findOneAndUpdate(
          {task_Id: parseInt(req.params.id)},
          {$set: {Status: "COMPLETED"}},
          {new: true}
        );
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "Task Progress Updated"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchEmployeesingletask: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup.",
        });
      }

      const fetchtask = await Task.findOne({task_Id: req.params.id});

      if (!fetchtask) {
        res.status(HttpStatusCodes.NOT_FOUND).json({error: "Task not found"});
        return;
      }

      const fetchmilestone = await Milestone.findOne({
        Milestone_id: fetchtask.MilestoneId,
      });
      const fetchprojects = await Project.findOne({
        ProjectId: fetchtask?.ProjectId,
      });

      const result = {
        MilestoneName: fetchmilestone?.Name || "",
        ProjectName: fetchprojects?.Project_Name || "",
        data: fetchtask,
      };
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch employee single project chart
  fetchemployeeprojectchartinfo: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const projectId = req.params.id;
      const fetchproject = await Project.findOne({ProjectId: projectId});
      if (!fetchproject) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not Found");
      }

      const result = {
        ProjectName: fetchproject.Project_name,
        Start_Date: fetchproject.Start_Date,
        End_Date: fetchproject.End_Date,
      };

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchEmpmloyeeTaskAllotted: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const fetchproject = await RoleResource.find({
        ProjectId: {$in: parseInt(req.params.id)},
      });

      const rrids = await fetchproject.map((item) => item.RRId);

      const response = await StaffMember.find({
        staff_Id: {$in: rrids},
      }).select("FirstName LastName Photos");

      const responseData = await Promise.all(
        response.map(async (staff) => {
          const designation = await Designation.findOne({
            Designation_Id: staff.DesignationId,
          });

          return {
            ...staff.toObject(),
            DesignationName: designation?.Designation_Name || null,
          };
        })
      );
      return res
        .status(HttpStatusCodes.OK)
        .json({result: responseData, success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchEmployeeRecentActivities: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const fetchtask = await Task.find({
        ProjectId: parseInt(req.params.id),
        Status: "COMPLETED",
      });
      if (!fetchtask) {
        res.status(HttpStatusCodes.NOT_FOUND).json({error: "Task not found"});
        return;
      }

      const response = await Promise.all(
        fetchtask.map(async (item) => {
          const fetchresource = await StaffMember.find({
            staff_Id: item?.Resource_Id,
          });

          const names = fetchresource
            .map((res) => `${res.FirstName} ${res.LastName}`)
            .join(", ");

          return {
            ...item.toObject(), // convert Mongoose doc to plain object
            Photos: fetchresource.map((res) => res.Photos?.[0]),
            Message: `${names} has completed the task ${item?.Task_Name}`,
          };
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchEmployeemilestoneprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      // check company

      let queryObj = {
        ProjectId: parseInt(req.params.id),
      };

      const response = await Milestone.find(queryObj);

      if (response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Milestone not found");
      }

      const resourceNamewithid = await Promise.all(
        response.map(async (item) => {
          const findprojectResources = await RoleResource.find({
            ProjectId: item.ProjectId,
          });

          const findresourcesRRid = await findprojectResources.map(
            (rrid) => rrid.RRId
          );

          const getresources = await StaffMember.find({
            staff_Id: findresourcesRRid,
          });

          const responseResult = {
            ...item.toObject(),
            Resourcedata: getresources.map((resource) => ({
              staff_id: resource.staff_Id, // Fetching staff_id
              FirstName: resource.FirstName, // Fetching FirstName
            })),
          };

          return responseResult;
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: resourceNamewithid});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchemployeesingleprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      // check company

      let queryObj = {
        ProjectId: parseInt(req.params.id),
      };
      const response = await Project.find(queryObj);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  approveTimesheetbyEmployee: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const {approvids} = req.body;

      for (let item of approvids) {
        const response = await TimeSheet.findOne({Timesheet_Id: {$in: item}});
        if (!response) {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error("timesheet not found ");
        } else {
          if (response?.Staff_Id === user?.staff_Id) {
            res.status(HttpStatusCodes.BAD_REQUEST);
            throw new Error("you can not approved you timesheet by yourself");
          }
          await response.updateOne({
            $set: {approval_status: "APPROVED", approved_by: user?.staff_Id},
          });
        }
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({message: "timesheet approved successfully ", success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  disapproveTimesheetbyEmployee: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const {approvids} = req.body;

      for (let item of approvids) {
        const response = await TimeSheet.findOne({Timesheet_Id: {$in: item}});
        if (!response) {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error("timesheet not found ");
        } else {
          if (response?.Staff_Id === user?.staff_Id) {
            res.status(HttpStatusCodes.BAD_REQUEST);
            throw new Error(
              "you can not disapproved you timesheet by yourself"
            );
          } else if (response?.approval_status === "APPROVED") {
            res.status(HttpStatusCodes?.BAD_REQUEST);
            throw new Error(
              "You Can not Dis approve this timesheet because it's alerady approved"
            );
          }
          await response.updateOne({
            $set: {approval_status: "DISAPPROVED", approved_by: user?.staff_Id},
          });
        }
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({message: "timesheet approved successfully ", success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  billedTimesheetbyEmployee: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const {approvids} = req.body;

      for (let item of approvids) {
        const response = await TimeSheet.findOne({Timesheet_Id: {$in: item}});
        if (!response) {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error("timesheet not found ");
        } else {
          if (response?.Staff_Id === user?.staff_Id) {
            res.status(HttpStatusCodes.BAD_REQUEST);
            throw new Error("you can not billed your timesheet by yourself");
          } else if (response?.approval_status === "DISAPPROVED") {
            res.status(HttpStatusCodes?.BAD_REQUEST);
            throw new Error(
              "You Can not Dis approve this timesheet because it's alerady approved"
            );
          }
          await response.updateOne(
            {
              $set: {billing_status: "BILLED"},
            },
            {new: true}
          );
        }
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = EmployeeCtr;
