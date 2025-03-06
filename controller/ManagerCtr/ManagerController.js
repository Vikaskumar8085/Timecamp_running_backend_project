const asyncHandler = require("express-async-handler");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Roles = require("../../models/MasterModels/Roles/Roles");
const Client = require("../../models/AuthModels/Client/Client");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const Task = require("../../models/Othermodels/Task/Task");
const Notification = require("../../models/Othermodels/Notification/Notification");
const managerCtr = {
  // fetch manager team
  fetchmanagerTeam: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User, please Signup");
      }

      let {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "name",
        order = "asc",
      } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      order = order === "desc" ? -1 : 1;

      const query = {
        ManagerId: user.staff_Id,
        ...(search && {
          $or: [
            {FirstName: {$regex: search, $options: "i"}},
            {Email: {$regex: search, $options: "i"}},
          ],
        }),
      };

      const fetchmanager = await StaffMember.find(query)
        .sort({[sortBy]: order})
        .skip((page - 1) * limit)
        .limit(limit);

      const totalRecords = await StaffMember.countDocuments(query);

      return res.status(HttpStatusCodes.OK).json({
        result: fetchmanager,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch manager projects
  fetchmanagerProjects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User, please Signup"});
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Searching
      const search = req.query.search || "";
      let query = {ManagerId: user?.staff_Id};
      if (search) {
        query["FirstName"] = {$regex: search, $options: "i"}; // Case-insensitive search
      }

      // Sorting
      const sortBy = req.query.sortBy || "FirstName";
      const order = req.query.order === "desc" ? -1 : 1;

      // Fetch staff with pagination, search, and sorting
      const fetchstaff = await StaffMember?.find(query)
        .sort({[sortBy]: order})
        .skip(skip)
        .limit(limit);

      if (!fetchstaff) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Staff Not Found"});
      }

      // Fetch projects for each staff member
      const fetchproject = await Promise.all(
        fetchstaff.map(async (item) => {
          try {
            // Find RoleResources for the given staff_Id
            const fetchprojectbyrrids = await RoleResource.find({
              RRId: item?.staff_Id,
            });

            // Extract ProjectIds from RoleResources
            const projectids = fetchprojectbyrrids.map((rr) => rr.ProjectId);

            // Fetch projects
            const fetchproject = projectids.length
              ? await Project.find({ProjectId: {$in: projectids}})
              : [];

            // Fetch projects where staff is a direct project manager
            const fetchteamproject = await Project.find({
              Project_ManagersId: item?.staff_Id,
            });

            return {fetchproject, fetchteamproject};
          } catch (error) {
            console.error(
              `Error fetching projects for staff ${item?.staff_Id}:`,
              error
            );
            return {fetchproject: [], fetchteamproject: []};
          }
        })
      );

      // Get total records count for pagination
      const totalRecords = await StaffMember.countDocuments(query);

      return res.status(HttpStatusCodes.OK).json({
        result: fetchproject,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
      });
    } catch (error) {
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({message: error.message});
    }
  }),
  // fetch manager active projects

  fetchmanagerActiveprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User, please Signup"});
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Searching
      const search = req.query.search || "";
      let query = {ManagerId: user?.staff_Id};
      if (search) {
        query["FirstName"] = {$regex: search, $options: "i"}; // Case-insensitive search
      }

      // Sorting
      const sortBy = req.query.sortBy || "FirstName";
      const order = req.query.order === "desc" ? -1 : 1;

      // Fetch staff with pagination, search, and sorting
      const fetchstaff = await StaffMember?.find(query)
        .sort({[sortBy]: order})
        .skip(skip)
        .limit(limit);

      if (!fetchstaff) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Staff Not Found"});
      }

      // Fetch projects for each staff member
      const fetchproject = await Promise.all(
        fetchstaff.map(async (item) => {
          try {
            // Find RoleResources for the given staff_Id
            const fetchprojectbyrrids = await RoleResource.find({
              RRId: item?.staff_Id,
            });

            // Extract ProjectIds from RoleResources
            const projectids = fetchprojectbyrrids.map((rr) => rr.ProjectId);

            // Fetch projects
            const fetchproject = projectids.length
              ? await Project.find({ProjectId: {$in: projectids}})
              : [];

            // Fetch projects where staff is a direct project manager
            const fetchteamproject = await Project.find({
              Project_ManagersId: item?.staff_Id,
              Project_Status: true,
            });

            return {fetchproject, fetchteamproject};
          } catch (error) {
            console.error(
              `Error fetching projects for staff ${item?.staff_Id}:`,
              error
            );
            return {fetchproject: [], fetchteamproject: []};
          }
        })
      );

      // Get total records count for pagination
      const totalRecords = await StaffMember.countDocuments(query);

      return res.status(HttpStatusCodes.OK).json({
        result: fetchproject,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
      });
    } catch (error) {
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({message: error.message});
    }
  }),

  fetchmanagerInActiveprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user?._id);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized User, please Signup",
        });
      }

      // Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      // Searching
      const search = req.query.search?.trim() || "";
      let query = {ManagerId: user.staff_Id};
      if (search) {
        query["FirstName"] = {$regex: search, $options: "i"}; // Case-insensitive search
      }

      // Sorting
      const sortBy = req.query.sortBy || "FirstName";
      const order = req.query.order === "desc" ? -1 : 1;

      // Fetch staff with pagination, search, and sorting
      const fetchstaff = await StaffMember.find(query)
        .sort({[sortBy]: order})
        .skip(skip)
        .limit(limit);

      if (fetchstaff.length === 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Staff Not Found",
        });
      }

      // Fetch projects for each staff member
      const fetchproject = await Promise.all(
        fetchstaff.map(async (item) => {
          try {
            // Find RoleResources for the given staff_Id
            const fetchprojectbyrrids = await RoleResource.find({
              RRId: item.staff_Id,
            });

            // Extract ProjectIds from RoleResources
            const projectids = fetchprojectbyrrids.map((rr) => rr.ProjectId);

            // Fetch projects linked to staff via RoleResource
            const fetchproject = projectids.length
              ? await Project.find({ProjectId: {$in: projectids}})
              : [];

            // Fetch projects where staff is a direct project manager and inactive
            const fetchteamproject = await Project.find({
              Project_ManagersId: item.staff_Id,
              Project_Status: false,
            });

            return {fetchproject, fetchteamproject};
          } catch (error) {
            console.error(
              `Error fetching projects for staff ${item.staff_Id}:`,
              error
            );
            return {fetchproject: [], fetchteamproject: []};
          }
        })
      );

      // Get total records count for pagination
      const totalRecords = await StaffMember.countDocuments(query);

      return res.status(HttpStatusCodes.OK).json({
        result: fetchproject,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
      });
    } catch (error) {
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({message: error.message});
    }
  }),
  // fetch manager team task
  fetchmanagerteamtasks: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User, please Signup");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // create manager project
  createManagerProject: asyncHandler(async (req, res) => {
    try {
      const {
        Project_Name,
        clientId,
        Project_Type,
        Project_Hours,
        Project_ManagersId,
        roleResources,
      } = req.body;
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

      const createproject = new Project({
        CompanyId: checkcompany.Company_Id,
        Project_Name,
        clientId,
        Project_Type,
        Project_Hours,
        Project_Status: true,
        Project_ManagersId,
        createdBy: user?.staff_Id,
      });
      if (!createproject) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Project Not Found");
      }

      await createproject.save();

      let responseClientId = createproject.clientId;

      if (!responseClientId) {
        return; // Exit if clientId is undefined or empty
      } else {
        await Client.updateOne(
          {Client_Id: responseClientId}, // Ensure we update the correct client
          {$set: {Client_Status: "Active"}} // Set Client_Status to Active
        );

        await Notification({
          SenderId: user?.staff_Id,
          ReciverId: createproject?.clientId,
          Name: user?.FirstName,
          Description: `You have been assigned to the ${Project_Name} project as a new client by the Manager.`,
          IsRead: false,
        }).save();
      }

      let responseProjectmangerid = createproject.Project_ManagersId;
      if (!responseProjectmangerid) {
        return;
      } else {
        await StaffMember.updateOne(
          {staff_Id: responseProjectmangerid},
          {$set: {IsActive: "Active"}}
        );

        await Notification({
          SenderId: user?.staff_Id,
          ReciverId: createproject?.responseProjectmangerid,
          Name: user?.FirstName,
          Description: `You have been assigned to the ${Project_Name} project as a new projectmanager by the Manager.`,
          IsRead: false,
        }).save();
      }
      const projectId = createproject?.ProjectId;
      console.log(projectId, "...");
      if (!Array.isArray(roleResources) || roleResources.length === 0) return;

      const roleResourceData = roleResources.map(({RRId, RId}) => ({
        RRId,
        RId,
        ProjectId: projectId,
      }));

      await RoleResource.insertMany(roleResourceData);

      try {
        let updatestaffmember = await Promise.all(
          (roleResources || []).map(async ({RRId, RId}) => {
            if (!RRId) return; // Skip invalid entries

            // Update staff member status
            await StaffMember.updateOne(
              {staff_Id: RRId},
              {$set: {IsActive: "Active"}}
            );

            // Send notification
            await Notification.create({
              SenderId: user?.user_id,
              ReciverId: RRId, // Receiver is RRId
              Name: user?.FirstName,
              Description: "Your role has been updated to Active",
              IsRead: false,
            });
          })
        );

        if (!updatestaffmember) {
          res.status(HttpStatusCodes.NOT_FOUND);
          throw new Error("staff Not found");
        }
      } catch (error) {
        console.error("Error updating staff members:", error);
      }

      res.status(201).json({
        message: "Project and Role Resources added successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchmanagerRoles: asyncHandler(async (req, res) => {
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

      const response = await Roles.find({
        CompanyId: checkcompany?.Company_Id,
      });
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Roles Not Found");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({result: response, success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchmanagerclients: asyncHandler(async (req, res) => {
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
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Client Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({result: response, success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchmanagerstaffmembers: asyncHandler(async (req, res) => {
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
  fetchMannagerNotificationmessage: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchmanagermilestons: asyncHandler(async (req, res) => {
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
      let queryObj = {};
      queryObj = {
        CompanyId: checkcompany.Company_Id,
      };

      const response = await Project.find(queryObj).lean().exec();

      const fetchprojectresponse = await Promise.all(
        response.map(async (item) => {
          try {
            // Fetch Milestone and RoleResource in parallel
            const [fetchmilestone, fetchrrid] = await Promise.all([
              Milestone.find({ProjectId: item.ProjectId}).lean(),
              RoleResource.find({ProjectId: item.ProjectId}).lean(),
            ]);

            // Process milestones
            const mileStonedata =
              fetchmilestone?.map((milestone) => ({
                ProjectId: item.ProjectId,
                milestoneId: milestone.Milestone_id,
                milestoneName: milestone.Name,
              })) || [];

            // Extract resource IDs
            const fetchresourcesId = fetchrrid?.map((rr) => rr.RRId) || [];

            // Fetch resource staff only if IDs exist
            const fetchresourcesstaff =
              fetchresourcesId.length > 0
                ? await StaffMember.find({
                    staff_Id: {$in: fetchresourcesId},
                  }).lean()
                : [];

            // Process resource staff and include ProjectId
            const resourcedata =
              fetchresourcesstaff?.map((staff) => ({
                ProjectId: item.ProjectId, // Include ProjectId here
                resourceId: staff.staff_Id,
                resourceName: staff.FirstName,
              })) || [];

            return {
              ...item,
              mileStonedata,
              resourcedata,
            };
          } catch (error) {
            console.error(
              `Error processing projectId ${item.ProjectId}:`,
              error
            );
            return {
              ...item,
              mileStonedata: [],
              resourcedata: [],
              error: error.message,
            };
          }
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: fetchprojectresponse});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  addmanagerProject: asyncHandler(async (req, res) => {
    try {
      const {
        Project_Name,
        clientId,
        Project_Type,
        Project_Hours,
        Project_ManagersId,
        roleResources,
      } = req.body;
      console.log(req.body);

      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const checkcompany = await Company?.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      // Create the project
      const newProject = new Project({
        CompanyId: checkcompany.Company_Id,
        Project_Name,
        clientId,
        Project_Type,
        Project_Hours,
        Project_Status: true,
        Project_ManagersId,
        createdBy: user?.staff_Id,
      });

      await newProject.save();

      let responseClientId = newProject.clientId;

      if (!responseClientId) {
        return; // Exit if clientId is undefined or empty
      } else {
        await Client.updateOne(
          {Client_Id: responseClientId}, // Ensure we update the correct client
          {$set: {Client_Status: "Active"}} // Set Client_Status to Active
        );
      }

      let responseProjectmangerid = newProject.Project_ManagersId;
      if (!responseProjectmangerid) {
        return;
      } else {
        await StaffMember.updateOne(
          {staff_Id: responseProjectmangerid},
          {$set: {IsActive: "Active"}}
        );
      }

      // Retrieve the generated ProjectId
      const projectId = newProject?.ProjectId;
      console.log(projectId, "...");

      // Exit early if roleResources is not a valid array or is empty
      if (!Array.isArray(roleResources) || roleResources.length === 0) return;

      const roleResourceData = roleResources.map(({RRId, RId}) => ({
        RRId,
        RId,
        ProjectId: projectId,
      }));

      await RoleResource.insertMany(roleResourceData);

      let updatestaffmember = await Promise.all(
        roleResources?.map(({RRId, RId}) =>
          StaffMember.updateOne({staff_Id: RRId}, {$set: {IsActive: "Active"}})
        ) || []
      );
      if (!updatestaffmember) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("staff Not found");
      }
      res.status(201).json({
        message: "Project and Role Resources added successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchManagerNotification: asyncHandler(async (req, res) => {
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

  FillManagerTimesheet: asyncHandler(async (req, res) => {
    try {
      let {entries} = req.body;

      // Ensure entries exist and are an array
      if (!entries || !Array.isArray(entries)) {
        return res.status(400).json({
          success: false,
          message: "Entries are required and must be an array",
        });
      }

      console.log(entries, ">>>>>>>>>>>");

      // Attach files if provided
      if (req.files?.length) {
        entries.forEach((entry, index) => {
          entry.fileattachment = req.files[index]?.path || null;
        });
      }

      // Format timesheet data
      const timesheetEntries = entries.map((entry) => ({
        Staff_Id: entry.Staff_Id,
        project: entry.ProjectId,
        hours: entry.hours,
        date: moment(entry.date).format("DD/MM/YYYY"),
        task_description: entry.Task_description,
        Description: entry.Description,
        attachment: entry.fileattachment || null,
      }));

      // Save entries to the database
      await TimeSheet.insertMany(timesheetEntries);

      return res.json({
        success: true,
        message: "Timesheet submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error?.message,
      });
    }
  }),

  RemovemanagerTimesheet: asyncHandler(async (req, res) => {
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
  sendForapprovelManagerTimesheet: asyncHandler(async (req, res) => {
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

  EditTimesheet: asyncHandler(async (req, res) => {
    try {
      const {id} = req.params;
      const {Staff_Id, ProjectId, hours, date, Task_description, Description} =
        req.body;

      // Find the existing timesheet entry
      const timesheetEntry = await TimeSheet.findById(id);
      if (!timesheetEntry) {
        return res.status(404).json({
          success: false,
          message: "Timesheet entry not found",
        });
      }

      // Handle file upload
      let fileAttachment = timesheetEntry.attachment; // Keep existing attachment if no new file
      if (req.file) {
        fileAttachment = req.file.path;
      }

      // Update the timesheet entry
      timesheetEntry.Staff_Id = Staff_Id || timesheetEntry.Staff_Id;
      timesheetEntry.project = ProjectId;
      timesheetEntry.hours = hours;
      timesheetEntry.date = moment(date).format("DD/MM/YYYY");
      timesheetEntry.task_description = Task_description;
      timesheetEntry.Description = Description;
      timesheetEntry.attachment = fileAttachment;
      await timesheetEntry.save();
      return res.json({
        success: true,
        message: "Timesheet updated successfully",
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  approvetimesheetbymanager: asyncHandler(async (req, res) => {
    try {
      console.log(req.body, req.params.id, "approv manger timesheet ???????");
      const approveIds = req.body;
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
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

      if (findTimesheet?.Staff_Id === user?.staff_Id) {
        res.status(HttpStatusCodes?.FORBIDDEN);
        throw new Error("You cannot approve your own timesheet");
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
                  approved_by: user.staff_Id,
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

  disapprovetimesheetbymanager: asyncHandler(async (req, res) => {
    try {
      console.log(req.body, req.params.id, "approv timesheet ???????");
      const approveIds = req.body;
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
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

      if (findTimesheet?.Staff_Id === user?.staff_Id) {
        res.status(HttpStatusCodes?.FORBIDDEN);
        throw new Error("You cannot approve your own timesheet");
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
                  approved_by: user.staff_Id,
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
  createtaskbymanager: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized User. Please Signup.",
        });
        return; // Ensure no further code runs after sending the response
      }

      // Check company
      const checkcompany = await Company.findOne({Company_Id: user?.CompanyId});
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company not exists. Please create a company first.",
        });
        return; // Ensure no further code runs after sending the response
      }
      let attachmentPath = req.file ? req.file.filename : Attachment;

      const newTask = new Task({
        Company_Id: checkcompany?.Company_Id,
        Task_Name: req.body.Task_Name,
        ProjectId: req.body.ProjectId,
        MilestoneId: req.body.MilestoneId,
        Priority: req.body.Priority,
        StartDate: req.body.StartDate,
        EndDate: req.body.EndDate,
        Estimated_Time: req.body.Estimated_Time,
        Task_description: req.body.Task_Description,
        Attachment: attachmentPath,
        Resource_Id: req.body.Resource_Id,
      });

      // Save the task to the database

      if (newTask) {
        await newTask.save();
        await new Notification({
          SenderId: user?.staff_Id,
          ReciverId: newTask?.Resource_Id,
          Name: user?.FirstName,
          Description: "You have been allotted a new task by the admin",
          IsRead: false,
        }).save();
      }
      res.status(201).json({
        message: "Task created successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch manager project

  fetchmanagertasks: asyncHandler(async (req, res) => {
    try {
      // Find the user
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          error: "Unauthorized User, please Signup",
        });
      }

      // Query to fetch manager
      const query = {
        ManagerId: user?.staff_Id,
      };
      const fetchmanager = await StaffMember.find(query);
      if (fetchmanager.length === 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          error: "Staff not found",
        });
      }

      // Fetch tasks for each manager
      const fetchtask = await Task.find({
        Resource_Id: {$in: fetchmanager.map((manager) => manager.staff_Id)}, // In case multiple managers, map their staff IDs
      });

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: fetchtask});
    } catch (error) {
      // Handle error
      console.error(error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        error: error.message || "An error occurred while fetching tasks.",
      });
    }
  }),
};

module.exports = managerCtr;
