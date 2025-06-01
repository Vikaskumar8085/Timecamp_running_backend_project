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
const Role = require("../../models/MasterModels/Roles/Roles");
const Bucket = require("../../models/Othermodels/Bucket/Bucket");
const moment = require("moment");
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
            { FirstName: { $regex: search, $options: "i" } },
            { Email: { $regex: search, $options: "i" } },
          ],
        }),
      };

      const fetchmanager = await StaffMember.find(query)
        .sort({ [sortBy]: order })
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
          .json({ message: "Unauthorized User, please Signup" });
      }

      const checkcompany = await Company.findOne({
        Company_Id: user?.CompanyId,
      });
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not Found");
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Searching (trim input and use OR operator)
      const search = req.query.search?.trim() || "";
      let queryObj = {
        createdBy: user?.staff_Id,
        CompanyId: checkcompany?.Company_Id,
      };

      if (search) {
        queryObj["$or"] = [
          { Project_Name: { $regex: search, $options: "i" } }, // Case-insensitive search in Project_Name
        ];
      }
      const totalProjects = await Project.countDocuments(queryObj);

      const responseResult = await RoleResource.find({ RRId: user.staff_Id });
      const rrid = responseResult.map((item) => item.ProjectId);

      queryObj = {
        $or: [{ ProjectId: { $in: rrid } }, { createdBy: user.staff_Id }],
      };

      // Fetch paginated projects
      const projects = await Project.find(queryObj)
        .skip((page - 1) * limit) // Skipping projects for the current page
        .limit(limit) // Limiting the number of projects per page
        .lean()
        .exec();

      if (!projects.length) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("No projects found");
      }

      // Fetch roles and staff details for each project
      // const projectsWithDetails = await Promise.all(
      //   projects.map(async (project) => {
      //     const roleResources = await RoleResource.find({
      //       ProjectId: {$in: project.ProjectId},
      //       IsProjectManager: false,
      //     });

      //     const roleProjectMangare = await RoleResource.find({
      //       ProjectId: project.ProjectId,
      //       IsProjectManager: true,
      //     });
      //     return {
      //       ...project,
      //       roleProjectMangare: roleProjectMangare,
      //       roleResources: roleResources,
      //     };
      //   })
      // );
      return res.status(HttpStatusCodes.OK).json({
        message: "Projects fetched successfully",
        result: projects,
        totalPages: Math.ceil(totalProjects / limit),
        currentPage: page,
        totalProjects,
        success: true,
      });
    } catch (error) {
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }),

  // fetch manager active projects

  fetchmanagerActiveprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized User, please Signup" });
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Searching
      const search = req.query.search || "";
      let query = { ManagerId: user?.staff_Id };
      if (search) {
        query["FirstName"] = { $regex: search, $options: "i" }; // Case-insensitive search
      }

      // Sorting
      const sortBy = req.query.sortBy || "FirstName";
      const order = req.query.order === "desc" ? -1 : 1;

      // Fetch staff with pagination, search, and sorting
      const fetchstaff = await StaffMember?.find(query)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      if (!fetchstaff) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ message: "Staff Not Found" });
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
              ? await Project.find({ ProjectId: { $in: projectids } })
              : [];

            // Fetch projects where staff is a direct project manager
            const fetchteamproject = await Project.find({
              Project_ManagersId: item?.staff_Id,
              Project_Status: true,
            });

            return { fetchproject, fetchteamproject };
          } catch (error) {
            console.error(
              `Error fetching projects for staff ${item?.staff_Id}:`,
              error
            );
            return { fetchproject: [], fetchteamproject: [] };
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
        .json({ message: error.message });
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
      let query = { ManagerId: user.staff_Id };
      if (search) {
        query["FirstName"] = { $regex: search, $options: "i" }; // Case-insensitive search
      }

      // Sorting
      const sortBy = req.query.sortBy || "FirstName";
      const order = req.query.order === "desc" ? -1 : 1;

      // Fetch staff with pagination, search, and sorting
      const fetchstaff = await StaffMember.find(query)
        .sort({ [sortBy]: order })
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
              ? await Project.find({ ProjectId: { $in: projectids } })
              : [];

            // Fetch projects where staff is a direct project manager and inactive
            const fetchteamproject = await Project.find({
              Project_ManagersId: item.staff_Id,
              Project_Status: false,
            });

            return { fetchproject, fetchteamproject };
          } catch (error) {
            console.error(
              `Error fetching projects for staff ${item.staff_Id}:`,
              error
            );
            return { fetchproject: [], fetchteamproject: [] };
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
        .json({ message: error.message });
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
        currency,
        bucket,
        roleResources,
        roleProjectMangare,
      } = req.body;

      var user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const checkcompany = await Company({ Company_Id: user?.CompanyId });
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
        Start_Date: moment(req.body.Start_Date).format("DD/MM/YYYY"),
        End_Date: moment(req.body.End_Date).format("DD/MM/YYYY"),
        createdBy: user?.staff_Id,
        ...req.body,
      });

      if (!createproject) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Project Not Found");
      }

      await createproject.save();

      // Create RoleResource

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

      const client = await Client.findOne({ Client_Id: responseClientId });
      if (!client) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error(`Client with ID ${responseClientId} not found.`);
      }

      if (client.Client_Status !== "Active") {
        await Client.updateOne(
          { Client_Id: responseClientId },
          { $set: { Client_Status: "Active" } }
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
          (roleResources || []).map(async ({ RRId, RId }) => {
            if (!RRId) return; // Skip invalid entries
            const staff = await StaffMember.findOne({ staff_Id: RRId });

            if (!staff) {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(`Staff with ID ${RRId} not found.`);
            }

            if (staff.IsActive !== "Active") {
              await StaffMember.updateOne(
                { staff_Id: RRId },
                { $set: { IsActive: "Active" } }
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
          (roleProjectMangare || []).map(async ({ RRId, RId }) => {
            if (!RRId) return;

            const staff = await StaffMember.findOne({ staff_Id: RRId });

            if (!staff) {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(`Staff with ID ${RRId} not found.`);
            }

            if (staff.IsActive !== "Active") {
              await StaffMember.updateOne(
                { staff_Id: RRId },
                { $set: { IsActive: "Active" } }
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
      // Send success response
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
      const checkcompany = await Company({ Company_Id: user?.CompanyId });
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
        .json({ result: response, success: true });
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
      const checkcompany = await Company({ Company_Id: user?.CompanyId });
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
        .json({ result: response, success: true });
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
      const checkcompany = await Company({ Company_Id: user?.CompanyId });
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
        .json({ success: true, result: response });
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
      const checkcompany = await Company({ Company_Id: user?.CompanyId });
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
              Milestone.find({ ProjectId: item.ProjectId }).lean(),
              RoleResource.find({ ProjectId: item.ProjectId }).lean(),
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
                    staff_Id: { $in: fetchresourcesId },
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
        .json({ success: true, result: fetchprojectresponse });
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
      }).sort({ createdAt: -1 });

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Employee Notficaiton Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ result: response, success: true });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  RemovemanagerTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const response = await TimeSheet.findOne({ Timesheet_Id: req.params.id });
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("TimeSheet NOT FOUND");
      } else {
        await response.deleteOne();
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: "Timesheet Remove Successfully" });
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
            const timesheet = await TimeSheet.findOne({ Timesheet_Id: item });

            // Check if the timesheet exists and if the status is "PENDING"
            if (!timesheet) {
              res.status(HttpStatusCodes.NOT_FOUND);
              throw new Error(`Timesheet with Timesheet_Id ${item} not found.`);
            }

            // Proceed with the update if it's 'PENDING'
            const updatedTimesheet = await TimeSheet.findOneAndUpdate(
              { Timesheet_Id: item },
              {
                $set: {
                  approval_status: "PENDING",
                },
              },
              { new: true, runValidators: true }
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
      const { id } = req.params;
      const {
        Staff_Id,
        ProjectId,
        hours,
        date,
        Task_description,
        Description,
      } = req.body;

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
            const timesheet = await TimeSheet.findOne({ Timesheet_Id: item });

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
              { Timesheet_Id: item },
              {
                $set: {
                  approval_status: "APPROVED",
                  approved_by: user.staff_Id,
                  approved_date: moment().format("DD/MM/YYYY"),
                },
              },
              { new: true, runValidators: true }
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
            const timesheet = await TimeSheet.findOne({ Timesheet_Id: item });

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
              { Timesheet_Id: item },
              {
                $set: {
                  approval_status: "DISAPPROVED",
                  approved_by: user.staff_Id,
                  approved_date: moment().format("DD/MM/YYYY"),
                },
              },
              { new: true, runValidators: true }
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
  // create manager task
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
      const checkcompany = await Company.findOne({
        Company_Id: user?.CompanyId,
      });
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
  // fetch manager task
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
      // Extract pagination and search parameters
      let { page = 1, limit = 10, search = "" } = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      // Query to fetch tasks
      const taskQuery = {
        Resource_Id: { $in: fetchmanager.map((manager) => manager.staff_Id) },
      };
      if (search) {
        taskQuery.Task_Name = { $regex: search, $options: "i" }; // Case-insensitive search
      }

      const totalTasks = await Task.countDocuments(taskQuery);
      const fetchtask = await Task.find(taskQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ CreatedAt: -1 }); // Sort by latest created
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: fetchtask,
        pagination: {
          totalRecords: totalTasks,
          totalPages: Math.ceil(totalTasks / limit),
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      // Handle error
      throw new Error(error?.message);
    }
  }),
  // fetch manager timesheet
  fetchmanagertimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          error: "Unauthorized User, please Signup",
        });
      }
      const response = await StaffMember.find({ ManagerId: user?.staff_Id });
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("staff not found");
      }
      const staffMemberIds = response.map((item) => item.staff_Id);
      staffMemberIds.push(user.staff_Id);
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      // Fetch timesheets with pagination
      const timesheets = await TimeSheet.find({
        Staff_Id: { $in: staffMemberIds },
      })
        .skip(skip)
        .limit(limit);

      if (!timesheets) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("timesheet not found");
      }
      const timesheetData = await Promise.all(
        timesheets.map(async (item) => {
          const fetchProject = await Project.findOne({
            ProjectId: item.project,
          });
          const projectName = fetchProject
            ? fetchProject.Project_Name
            : "Unknown Project";
          return { ...item.toObject(), projectName };
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        page,
        limit,
        total: timesheetData.length,
        result: timesheetData,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchprojectinfo: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please singup");
      }

      const company = await Company?.findOne({ Company_Id: user?.CompanyId });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {
        CompanyId: company.Company_Id,
        ProjectId: req.params.id,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      const projectsWithDetails = await Promise.all(
        response.map(async (projectitem) => {
          const roleResources = await RoleResource.find({
            ProjectId: projectitem.ProjectId,
          });

          // Extract RRId values
          const rIds = roleResources.map((rr) => rr.RId);
          const roles = await Role.find({ RoleId: { $in: rIds } });
          const rrid = roleResources.map((rr) => rr.RRId);

          const staffMember = await StaffMember.find({
            staff_Id: { $in: rrid },
          });

          const responseclient = await Client.find({
            Client_Id: projectitem.clientId,
          });
          const ProjectManager = await StaffMember.find({
            staff_Id: { $in: projectitem.Project_ManagersId },
          });
          const ProjectManagerName = await ProjectManager.map(
            (item) => item.FirstName
          );
          const ClientName = await responseclient.map(
            (item) => item.Client_Name
          );
          const RoleName = await roles.map((item) => item.RoleName);
          const StaffName = await staffMember.map((item) => item.FirstName);

          const projectResult = {
            ...projectitem,
            RoleName,
            StaffName,
            ClientName,
            ProjectManagerName,
          };
          return projectResult;
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        message: "fetch project info successfully",
        result: projectsWithDetails,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchmanagerprojecttimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please singup");
      }

      let { search, page = 1, limit = 10 } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      let queryObj = { ProjectId: req.params.id };

      // Adding search functionality
      if (search.trim()) {
        queryObj.$or = [{ Project_Name: { $regex: search, $options: "i" } }];
      }

      const totalProjects = await Project.countDocuments(queryObj);
      const response = await Project.find(queryObj).skip(skip).limit(limit);

      if (!response.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not Found");
      }

      const projectDetails = await Promise.all(
        response.map(async (item) => {
          const findtimesheet = await TimeSheet.find({
            project: item.ProjectId,
          });
          return { findtimesheet };
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: projectDetails,
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
  fetchmanagerprojecttasks: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please singup");
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
        .json({ success: true, result: taskDetails });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  createmanagermilestone: asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { milestones } = req.body;
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({
        Company_Id: user?.CompanyId,
      });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      if (!Array.isArray(milestones) || milestones.length === 0) {
        return res.status(400).json({
          message: "Milestones data is required and should be an array.",
        });
      }
      let insertedMilestones = [];
      for (const item of milestones) {
        const milestone = new Milestone({
          Compnay_Id: checkcompany?.Compnay_Id,
          ProjectId: projectId,
          Name: item.MilestoneName,
          Description: item.Description,
          Start_date: new Date(item.StartDate),
          End_date: new Date(item.EndDate),
        });

        const savedMilestone = await milestone.save();
        insertedMilestones.push(savedMilestone);
      }

      // res.json({
      //   message: "Bulk upload successful!",
      //   insertedCount: insertedMilestones.length,
      // });

      // console.log(insertedMilestones, "dasldkfskd");

      return res.status(HttpStatusCodes.OK).json({
        message: " milestone created successfully",
        success: true,
        result: insertedMilestones,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchmanagermilestonestask: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({
        Company_Id: user?.CompanyId,
      });
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company not exists. Please create a company first.",
        });
        return;
      }

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
        .json({ success: true, result: resourceNamewithid });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fill manager timesheet
  FillManagerProjectTimesheet: asyncHandler(async (req, res) => {
    try {
      const { newdata } = req.body;
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      let attachmentPath = req.file ? req.file.filename : "";
      const todaydata = new Date();

      const response = new TimeSheet({
        attachement: attachmentPath,
        ...req.body,
        Staff_Id: req?.user?.staff_Id,
        approval_status: null,
      });

      await response.save();
      // for (let item of newdata) {
      //   const Timesheetdata = new Timesheet({
      //     Staff_Id: user.staff_Id,
      //     hours: item.hours,
      //     project: item.Projectid,
      //     day: item.day,
      //     Description: item.Description,
      //     task_description: item.task_description,
      //     attachement: attachmentPath,
      //   });
      //   const saveTimesheetdata = await Timesheetdata.save();
      //   inputdata.push(saveTimesheetdata);
      // }

      return res.status(HttpStatusCodes.CREATED).json({
        message: "Timesheet Filled Successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // create manager project task

  addProjectTask: asyncHandler(async (req, res) => {
    try {
      console.log(req.body, "/");
      const { id } = req.params;
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized User. Please Signup.",
        });
        return; // Ensure no further code runs after sending the response
      }

      // Check company
      const checkcompany = await Company.findOne({
        Company_Id: user?.CompanyId,
      });
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company not exists. Please create a company first.",
        });
        return; // Ensure no further code runs after sending the response
      }
      console.log(checkcompany);
      let attachmentPath = req.file ? req.file.filename : Attachment;
      // Create a new task instance
      const newTask = new Task({
        Company_Id: checkcompany?.Company_Id,
        Task_Name: req.body.Task_Name,
        ProjectId: Number(id),
        MilestoneId: req.body.MilestoneId,
        Priority: req.body.Priority,
        StartDate: req.body.StartDate,
        EndDate: req.body.EndDate,
        Estimated_Time: req.body.Estimated_Time,
        Task_description: req.body.Task_Description,
        Attachment: attachmentPath,
        Resource_Id: req.body.Resource_Id,
      });

      if (newTask) {
        await newTask.save();
        // await new Notification({
        //   SenderId: user?.user_id,
        //   ReciverId: newTask?.Resource_Id,
        //   Name: user?.FirstName,
        //   Description: "You have been allotted a new task by the admin",
        //   IsRead: false,
        // }).save();
      }
      // Save the task to the database
      res.status(201).json({
        message: "Task created successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchmanagerprojectmilestones: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized User. Please Signup.",
        });
        return; // Ensure no further code runs after sending the response
      }

      // Check company
      const checkcompany = await Company.findOne({
        Company_Id: user?.CompanyId,
      });
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company not exists. Please create a company first.",
        });
        return; // Ensure no further code runs after sending the response
      }

      let queryObj = {};

      queryObj = {
        ProjectId: parseInt(req.params.id),
      };

      const response = await Milestone.find(queryObj);
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: response });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // manager project Time
  fetch_manager_project_time: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized User. Please Signup.",
        });
      }

      // Check if company exists
      const checkcompany = await Company.findOne({
        Company_Id: user?.CompanyId,
      });
      if (!checkcompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company does not exist. Please create a company first.",
        });
      }

      let { search, page = 1, limit = 10 } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      let queryObj = { CompanyId: checkcompany.Company_Id };

      // **Adding search functionality**
      if (search) {
        queryObj.$or = [
          { Project_Name: { $regex: search, $options: "i" } },
          { Project_Code: { $regex: search, $options: "i" } },
        ];
      }

      // Step 1: Get projects based on query and pagination
      const totalProjects = await Project.countDocuments(queryObj);
      const projects = await Project.find(queryObj).skip(skip).limit(limit);

      if (!projects || projects.length === 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "No projects found",
        });
      }

      // Extract project IDs
      const projectIds = projects.map((project) => project.ProjectId);

      // Step 2: Aggregate TimeSheet data for these projects
      const timesheetData = await TimeSheet.aggregate([
        {
          $match: {
            CompanyId: checkcompany.Company_Id,
            project: { $in: projectIds },
          },
        },
        {
          $group: {
            _id: "$project",
            totalHours: { $sum: { $toDouble: "$hours" } },
            okHours: { $sum: { $toDouble: "$ok_hours" } },
            billedHours: { $sum: { $toDouble: "$billed_hours" } },
            totalEntries: { $sum: 1 }, // Count total timesheet entries per project
          },
        },
      ]);

      // Step 3: Map timesheet data back to projects
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

  fetchManagerTeamInformation: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized User. Please Signup.",
        });
      }

      // Check if company exists
      const checkcompany = await Company.findOne({
        Company_Id: user?.CompanyId,
      });
      if (!checkcompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company does not exist. Please create a company first.",
        });
      }

      const { id } = req.params;

      const getteam = await StaffMember.findOne({ staff_Id: parseInt(id) });
      if (!getteam) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Team Not Found");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: getteam });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // edit project

  editmanagerProject: asyncHandler(async (req, res) => {
    try {
      const { ProjectId } = req.params;
      const {
        // Required to identify the project to update
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

      // Authenticate
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized user");
      }

      const project = await Project.findOne({ ProjectId: ProjectId });
      if (!project) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project not found");
      }
      project.createdBy = user?.staff_Id;
      project.Project_Name = Project_Name;
      project.clientId = clientId;
      project.Project_Type = Project_Type;
      project.Project_Hours = Project_Hours;
      project.currency = currency;
      project.Start_Date = moment(Start_Date).format("DD/MM/YYYY");
      project.End_Date = moment(End_Date).format("DD/MM/YYYY");

      await project.save();

      if (Project_Type !== "Bucket" && (!bucket || bucket.length === 0)) {
        // Delete existing buckets
        await Bucket.deleteMany({ ProjectId: ProjectId });
      } else {
        if (!Array.isArray(bucket)) {
          return res.status(400).json({
            message: "bucket data should be an array.",
          });
        }

        await Bucket.deleteMany({ ProjectId: ProjectId });

        for (const item of bucket) {
          await new Bucket({
            ProjectId: ProjectId,
            bucketHourly: item.bucketHourly,
            bucketHourlyRate: item.bucketHourlyRate,
          }).save();
        }
      }

      // Activate client if exists
      if (clientId) {
        await Client.updateOne(
          { Client_Id: clientId },
          { $set: { Client_Status: "Active" } }
        );

        await Notification.create({
          SenderId: user.user_id,
          ReciverId: clientId,
          Name: user.FirstName,
          Pic: user.Photo,
          Description: `Your assigned project (${Project_Name}) has been updated.`,
          IsRead: false,
        });
      }

      // Role Resources

      await RoleResource.deleteMany({
        ProjectId: ProjectId,
      });

      if (Array.isArray(roleProjectMangare)) {
        for (let item of roleProjectMangare) {
          await new RoleResource({
            RRId: item.RRId,
            RId: item.RId,
            ProjectId: ProjectId,
            IsProjectManager: true,
            Rate: item.Rate,
            billable: item.billable,
            Unit: item.Unit,
            Engagement_Ratio: item.Engagement_Ratio,
          }).save();

          // Activate staff
          const staff = await StaffMember.findOne({ staff_Id: item.RRId });
          if (staff && staff.IsActive !== "Active") {
            await StaffMember.updateOne(
              { staff_Id: item.RRId },
              { $set: { IsActive: "Active" } }
            );
          }

          await Notification.create({
            SenderId: user.staff_Id,
            ReciverId: item.RRId,
            Name: user.FirstName,
            Pic: user.Photo,
            Description: "Your role as Project Manager has been updated",
            IsRead: false,
          });
        }
      }

      //Role Resources

      // Project Manager

      // Clean up and insert regular roleResources
      await RoleResource.deleteMany({
        ProjectId: ProjectId,
      });

      if (Array.isArray(roleResources)) {
        for (let item of roleResources) {
          await new RoleResource({
            RRId: item.RRId,
            RId: item.RId,
            ProjectId: ProjectId,
            billable: item.billable,
            Rate: item.Rate,
            Unit: item.Unit,
            Engagement_Ratio: item.Engagement_Ratio,
          }).save();

          const staff = await StaffMember.findOne({ staff_Id: item.RRId });
          if (staff && staff.IsActive !== "Active") {
            await StaffMember.updateOne(
              { staff_Id: item.RRId },
              { $set: { IsActive: "Active" } }
            );
          }

          await Notification.create({
            SenderId: user.staff_Id,
            ReciverId: item.RRId,
            Name: user.FirstName,
            Pic: user.Photo,
            Description: "Your project role has been updated",
            IsRead: false,
          });
        }
      }

      res.status(200).json({
        message: "Project updated successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch master team projects :
  fetchmanagerteamprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized user");
      }

      const { id } = req.params;

      const response = await RoleResource.find({ RRId: parseInt(id) });

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Team Not Found");
      }

      console.log(response, "response");

      const projectids = await response?.map((item) => item?.ProjectId);

      const fetchProject = await Project.find({
        ProjectId: { $in: projectids },
      });
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: fetchProject });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchmanagerteamprojecttimesheets: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized user");
      }
      const { id } = req.params;

      const response = await TimeSheet.find({ staff_Id: parseInt(id) });

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("TImesheet Not Found");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: response });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchManagerTaskAllotted: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const fetchproject = await RoleResource.find({
        ProjectId: { $in: parseInt(req.params.id) },
      });

      const rrids = await fetchproject.map((item) => item.RRId);

      const response = await StaffMember.find({
        staff_Id: { $in: rrids },
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
        .json({ result: responseData, success: true });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchManagerRecentActivities: asyncHandler(async (req, res) => {
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
        res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Task not found" });
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
        .json({ success: true, result: response });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchManagermilestoneprojects: asyncHandler(async (req, res) => {
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
        .json({ success: true, result: resourceNamewithid });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = managerCtr;
