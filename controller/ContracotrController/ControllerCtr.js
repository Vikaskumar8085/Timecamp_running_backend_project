const asyncHandler = require("express-async-handler");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const Task = require("../../models/Othermodels/Task/Task");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Roles = require("../../models/MasterModels/Roles/Roles");
const Client = require("../../models/AuthModels/Client/Client");
const Notification = require("../../models/Othermodels/Notification/Notification");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
const path = require("path");
const moment = require("moment");
const Bucket = require("../../models/Othermodels/Bucket/Bucket");

const parseFormDataEntries = (body, files) => {
  const entries = [];
  const entryMap = {};

  // Group fields by index
  for (const key in body) {
    const match = key.match(/entries\[(\d+)]\[(\w+)]/);
    if (match) {
      const [, index, field] = match;
      if (!entryMap[index]) entryMap[index] = {};
      entryMap[index][field] = body[key];
    }
  }

  // Attach files
  if (files && Array.isArray(files)) {
    files.forEach((file) => {
      const match = file.fieldname.match(/entries\[(\d+)]\[attachment]/);
      if (match) {
        const [_, index] = match;
        if (!entryMap[index]) entryMap[index] = {};
        entryMap[index]["attachment"] = file.filename; // or `file.path` if full path needed
      }
    });
  }

  for (const index in entryMap) {
    entries.push(entryMap[index]);
  }

  return entries;
};

const ContractorCtr = {
  fetchcontractorprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized User ! Please Signup");
      }

      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = responseResult.map((item) => item.ProjectId);

      let queryObj = {};
      queryObj = {
        $or: [{ProjectId: {$in: rrid}}, {createdBy: user.staff_Id}],
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }

      // const responseResult = await RoleResource.find({RRId: user.staff_Id});
      // const rrid = await responseResult.map((item) => item.ProjectId);

      // const contractorProjects = await Project.find({ProjectId: rrid});

      // const allProjects = {response, contractorProjects};
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
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

      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = responseResult.map((item) => item.ProjectId);

      let queryObj = {
        ProjectId: {$in: rrid},
        Project_Status: true,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      // const responseResult = await RoleResource.find({RRId: user.staff_Id});
      // const rrid = await responseResult.map((item) => item.ProjectId);

      // const contractoractiveProjects = await Project.find({
      //   ProjectId: rrid,
      //   Project_Status: true,
      // });

      // const activeprojects = {response, contractoractiveProjects};

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
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
      const responseResult = await RoleResource.find({RRId: user.staff_Id});
      const rrid = responseResult.map((item) => item.ProjectId);
      queryObj = {
        Project_Status: false,
        ProjectId: {$in: rrid},
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      // const responseResult = await RoleResource.find({RRId: user.staff_Id});
      // const rrid = await responseResult.map((item) => item.ProjectId);

      // const contractorinactiveProjects = await Project.find({
      //   ProjectId: rrid,
      //   Project_Status: false,
      // });

      // const inactiveprojects = {response, contractorinactiveProjects};

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  FillContractorProjectTimesheet: asyncHandler(async (req, res) => {
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

  // fetch contractor project Timesheet
  fetchContractorProjectTimesheet: asyncHandler(async (req, res) => {
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

  fetchContractorProjectTask: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Sign Up.");
      }

      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      let queryObj = {ProjectId: req.params.id};
      const projects = await Project.find(queryObj);

      if (!projects || projects.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not Found");
      }

      const taskDetails = await Promise.all(
        projects.map(async (project) => {
          let taskQuery = {ProjectId: project.ProjectId};

          // Adding search filter if provided
          if (search) {
            taskQuery["Task_Name"] = {$regex: search, $options: "i"}; // Case-insensitive search
          }

          const totalTasks = await Task.countDocuments(taskQuery);
          const tasks = await Task.find(taskQuery)
            .skip((page - 1) * limit)
            .limit(limit);

          return {
            tasks,
            pagination: {
              totalTasks,
              currentPage: page,
              totalPages: Math.ceil(totalTasks / limit),
            },
          };
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: taskDetails});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchcontractorsingletprojectinformation: asyncHandler(async (req, res) => {
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
                : [], // Extract FirstName from found members
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
  getcontractortimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized User, Please Signup");
      }

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

      const totalRecords = await TimeSheet.countDocuments(query);
      const fetchTimesheet = await TimeSheet.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

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
  getcontractortasks: asyncHandler(async (req, res) => {
    try {
      // Check if the user is authenticated
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized User Please Signup ");
      }

      // Get pagination and search parameters from the request query
      const {page = 1, limit = 10, search = ""} = req.query;
      const skip = (page - 1) * limit;

      // Create search filter
      const searchFilter = {
        Resource_Id: user.staff_Id, // Always filter by the current user's staffId
      };

      // Apply search if the user provided a search term
      if (search) {
        searchFilter.$or = [{Task_Name: {$regex: search, $options: "i"}}];
      }

      // Fetch tasks from the database with pagination and search filter
      const gettaskresponse = await Task.find(searchFilter)
        .skip(skip)
        .limit(Number(limit));

      if (!gettaskresponse || gettaskresponse.length === 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "No tasks found for this user.",
        });
      }

      // Fetch total count of tasks for pagination
      const totalTasks = await Task.countDocuments(searchFilter);

      // Fetch additional data (milestones, resources, projects) for each task
      const response = await Promise.all(
        gettaskresponse.map(async (item) => {
          // Fetch the milestone details for the current task
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
  // fetch company
  fetchcontractorroles: asyncHandler(async (req, res) => {
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
        throw new Error("Designation Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: fetchRoles});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch clients
  fetchContractorclients: asyncHandler(async (req, res) => {
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
  fetchContractorstaffmember: asyncHandler(async (req, res) => {
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
  fetchContractorNotificationMessage: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  addContractorProject: asyncHandler(async (req, res) => {
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

      // bucket added
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

      // client data added

      // project multiple role resource added

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

      // project mamanger created by Contractor

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
  removeContractorTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const response = await TimeSheet.findOne({Timesheet_Id: req.params.id});
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("TimeSheet NOT FOUND");
      } else {
        await response.deleteOne();
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "Timesheet Remove Successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchContractornotification: asyncHandler(async (req, res) => {
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
  fetchcontractorproject_time: asyncHandler(async (req, res) => {
    try {
      // Fetch the currently authenticated user
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized User Please Signup ");
      }

      // Ensure that the user is a contractor
      const contractordata = await StaffMember.findOne({
        staff_Id: user?.staff_Id,
        Role: "Contractor", // Filter only contractors
      });

      if (!contractordata) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Contractor not found",
        });
      }

      // Get search, page, and limit from query parameters
      let {search, page = 1, limit = 10} = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      // Build the query object to fetch projects for the contractor
      const queryObj = {
        $or: [
          {createdBy: contractordata?.staff_Id},
          {Project_ManagersId: contractordata?.staff_Id},
          {
            ProjectId: {
              $in: await RoleResource.find({
                RRId: contractordata?.staff_Id,
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
  contractorfilltimehseet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user._id);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup.",
        });
      }

      // Optional: Handle single attachment outside FormData (if any)
      let attachmentPath = req.file ? req.file.filename : null;
      let uploadPath = "uploads";

      if (req.file) {
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const mimeType = req.file.mimetype;

        if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
          uploadPath = path.join(uploadPath, "documents");
        } else if (
          [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)
        ) {
          uploadPath = path.join(uploadPath, "images");
        } else if (mimeType === "text/csv") {
          uploadPath = path.join(uploadPath, "csv");
        } else {
          uploadPath = path.join(uploadPath, "others");
        }
      }

      const contractorAttachment = attachmentPath
        ? `${req.protocol}://${req.get("host")}/${uploadPath}/${attachmentPath}`
        : null;

      const parsedEntries = parseFormDataEntries(req.body, req.files);
      const entriesToInsert = [];

      for (const entry of parsedEntries) {
        entriesToInsert.push({
          project: entry.project,
          user: user.staff_Id,
          hours: Number(entry.hours),
          day: new Date(entry.day),
          Description: entry.Description,
          task_description: entry.task_description,
          attachment: entry.attachment || contractorAttachment, // Fallback if FormData didn't include one
        });
      }

      const savedEntries = await TimeSheet.insertMany(entriesToInsert);

      return res.status(HttpStatusCodes.CREATED).json({
        message: "Timesheet Filled Successfully",
        result: savedEntries,
        success: true,
      });
    } catch (error) {
      console.error("Error filling timesheet:", error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server Error",
        error: error.message,
        success: false,
      });
    }
  }),

  // fetch contractor timesheet
  fetchcontractortimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup.",
        });
      }

      const {page = 1, limit = 10, search = ""} = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = {project: parseInt(req.params.id)};

      if (search) {
        query.$or = [
          {task_description: {$regex: search, $options: "i"}}, // Case-insensitive search in task description
          {Description: {$regex: search, $options: "i"}}, // Case-insensitive search in description
        ];
      }

      const totalCount = await TimeSheet.countDocuments(query);
      const response = await TimeSheet.find(query)
        .skip(skip)
        .limit(parseInt(limit));

      if (!response.length) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Timesheet Not found",
        });
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: parseInt(page),
        totalRecords: totalCount,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch contractor timesheet
  fetchcontractormilestones: asyncHandler(async (req, res) => {
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

  // fill tasks
  addtaskprogress: asyncHandler(async (req, res) => {
    try {
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

  fetchcontractorsingletask: asyncHandler(async (req, res) => {
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

  // fetch contractor project chart

  fetchcontractorinfochart: asyncHandler(async (req, res) => {
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

  fetchcontractorrecentstaff: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please sign up.",
        });
      }

      const fetchprojectstaff = await Project.findOne({
        ProjectId: Number(req.params.id),
      });

      if (!fetchprojectstaff) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Project not found",
        });
      }

      const projectmanager = await StaffMember.findOne({
        staff_Id: fetchprojectstaff?.Project_ManagersId,
      });

      const roleresourcedata = await RoleResource.find({
        ProjectId: Number(req.params.id),
      });

      if (!roleresourcedata || roleresourcedata.length === 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Role Resources not found",
        });
      }

      const staffids = roleresourcedata.map((item) => item.RRId);
      const staffteam = await StaffMember.find({staff_Id: {$in: staffids}});

      if (!staffteam || staffteam.length === 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Staff team not found",
        });
      }

      const team = staffteam.map((item) => item.FirstName);

      // Safely push project manager's name if found
      if (projectmanager?.FirstName) {
        team.push(projectmanager.FirstName);
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: team,
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error?.message || "Something went wrong",
      });
    }
  }),

  fetchContractorTaskAllotted: asyncHandler(async (req, res) => {
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
  fetchContractorRecentActivities: asyncHandler(async (req, res) => {
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
  fetchContractormilestoneprojects: asyncHandler(async (req, res) => {
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

  approveTimesheetbyContractor: asyncHandler(async (req, res) => {
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
  disapproveTimesheetbyContractor: asyncHandler(async (req, res) => {
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
  billedTimesheetbyContractor: asyncHandler(async (req, res) => {
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

module.exports = ContractorCtr;
