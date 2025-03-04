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
        createdBy: user?.staff_Id,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }

      const responseResult = await RoleResource.find({ RRId: user.staff_Id });
      const rrid = await responseResult.map((item) => item.ProjectId);

      const contractorProjects = await Project.find({ ProjectId: rrid });

      const allProjects = { response, contractorProjects };
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: allProjects });
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
        createdBy: user?.staff_Id,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      const responseResult = await RoleResource.find({ RRId: user.staff_Id });
      const rrid = await responseResult.map((item) => item.ProjectId);

      const contractoractiveProjects = await Project.find({
        ProjectId: rrid,
        Project_Status: true,
      });

      const activeprojects = { response, contractoractiveProjects };

      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: activeprojects });
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
        createdBy: user?.staff_Id,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      const responseResult = await RoleResource.find({ RRId: user.staff_Id });
      const rrid = await responseResult.map((item) => item.ProjectId);

      const contractorinactiveProjects = await Project.find({
        ProjectId: rrid,
        Project_Status: false,
      });

      const inactiveprojects = { response, contractorinactiveProjects };

      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: inactiveprojects });
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
        const Timesheetdata = new TimeSheet({
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
        .json({ success: true, result: projectDetails });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchContractorProjectTask: asyncHandler(async (req, res) => {
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
        .json({ success: true, result: taskDetails });
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
            staff_Id: { $in: rrids },
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
        throw new error("UnAuthorized User Please Singup ");
      }

      const fetchTimesheet = await TimeSheet.find({
        Staff_Id: user.staff_Id,
      });

      return res
        .status(HttpStatusCodes.OK)
        .json({ result: fetchTimesheet, success: true });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  getcontractortasks: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }
      const gettaskresponse = await Task.find({ Resource_Id: user.staff_Id });
      if (!gettaskresponse) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Task Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ result: gettaskresponse, success: true });
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
      const checkcompany = await Company({ Company_Id: user?.CompanyId });
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not Found");
      }

      const fetchRoles = await Roles.find({
        CompanyId: { $in: checkcompany?.Company_Id },
      });

      if (!fetchRoles) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Designation Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: fetchRoles });
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
      const checkcompany = await Company({ Company_Id: user?.CompanyId });
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
        .json({ success: true, result: response });
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
        Project_ManagersId,
        roleResources,
      } = req.body;
      console.log(req.body);

      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new error("UnAuthorized User Please Singup ");
      }

      const checkcompany = await Company?.findOne({ UserId: user?.user_id });
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
          { Client_Id: responseClientId }, // Ensure we update the correct client
          { $set: { Client_Status: "Active" } } // Set Client_Status to Active
        );

        await Notification({
          SenderId: user?.staff_Id,
          ReciverId: responseClientId?.clientId,
          Name: user?.FirstName,
          Description: `You have been assigned to the ${Project_Name} project as a new client.`,
          IsRead: false,
        }).save();
      }

      let responseProjectmangerid = newProject.Project_ManagersId;
      if (!responseProjectmangerid) {
        return;
      } else {
        await StaffMember.updateOne(
          { staff_Id: responseProjectmangerid },
          { $set: { IsActive: "Active" } }
        );
        await Notification({
          SenderId: user?.staff_Id,
          ReciverId: responseProjectmangerid,
          Name: user?.FirstName,
          Description: `You have been assigned to the ${Project_Name} project as a new project Manager.`,
          IsRead: false,
        }).save();
      }

      // Retrieve the generated ProjectId
      const projectId = newProject?.ProjectId;
      console.log(projectId, "...");

      if (!Array.isArray(roleResources) || roleResources.length === 0) return;

      const roleResourceData = roleResources.map(({ RRId, RId }) => ({
        RRId,
        RId,
        ProjectId: projectId,
      }));

      await RoleResource.insertMany(roleResourceData);

      try {
        let updatestaffmember = await Promise.all(
          (roleResources || []).map(async ({ RRId, RId }) => {
            if (!RRId) return; // Skip invalid entries

            // Update staff member status
            await StaffMember.updateOne(
              { staff_Id: RRId },
              { $set: { IsActive: "Active" } }
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

  removeContractorTimesheet: asyncHandler(async (req, res) => {
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
};

module.exports = ContractorCtr;
