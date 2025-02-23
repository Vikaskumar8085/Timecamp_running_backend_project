const asyncHandler = require("express-async-handler");
const User = require("../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const Role = require("../../models/MasterModels/Roles/Roles");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const Client = require("../../models/AuthModels/Client/Client");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const generateProjectCode = async () => {
  const lastProject = await Project.findOne().sort({ ProjectId: -1 });
  const lastId = lastProject ? lastProject.ProjectId : 0;
  const newProjectId = lastId + 1;
  return `P${newProjectId.toString().padStart(3, "0")}`;
};

const projectCtr = {
  create_Project: asyncHandler(async (req, res) => {
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

      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
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
      }

      // Retrieve the generated ProjectId
      const projectId = newProject?.ProjectId;
      console.log(projectId, "...");

      // Exit early if roleResources is not a valid array or is empty
      if (!Array.isArray(roleResources) || roleResources.length === 0) return;

      const roleResourceData = roleResources.map(({ RRId, RId }) => ({
        RRId,
        RId,
        ProjectId: projectId,
      }));

      await RoleResource.insertMany(roleResourceData);

      res.status(201).json({
        message: "Project and Role Resources added successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch projects

  fetch_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {
        CompanyId: company.Company_Id,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      const projectsWithDetails = await Promise.all(
        response.map(async (project) => {
          const roleResources = await RoleResource.find({
            ProjectId: project.ProjectId,
          });

          // Extract RRId values
          const rIds = roleResources.map((rr) => rr.RId);
          const roles = await Role.find({ RoleId: { $in: rIds } });
          const rrid = roleResources.map((rr) => rr.RRId);

          const staffMember = await StaffMember.find({
            staff_Id: { $in: rrid },
          });

          return { ...project, roles, staffMember };
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        message: "fetch projects successfully",
        result: projectsWithDetails,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetch_active_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        CompanyId: company?.Company_Id,
        Project_Status: true,
      };
      const response = await Project.find(queryObj).lean().exec();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        message: "fetch project successfully",
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetch_inactive_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        CompanyId: company?.Company_Id,
        Project_Status: false,
      };
      const response = await Project.find(queryObj).lean().exec();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        message: "fetch project successfully",
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //
  fetchstaffmembers: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {
        CompanyId: company.Company_Id,
      };
      const response = await StaffMember.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch single project
  fetchsingleprojects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
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
        message: "fetch single projects successfully",
        result: projectsWithDetails,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchProjectTimesheet: asyncHandler(async (req, res) => {
    try {
      const user = await User.findOne(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {
        CompanyId: company.Company_Id,
        project: req.params.id,
      };

      const response = await TimeSheet.find(queryObj);

      const timesheetfetchdata = await Promise.all(
        response.map(async (item) => {
          const getprojectName = await Project.find({
            ProjectId: item.project,
          });

          let ProjectName = await getprojectName.map((projectitem) => {
            return projectitem.Project_Name;
          });

          const fetchStaff = await StaffMember.find({
            staff_Id: item.Staff_Id,
          });

          let StaffName = await fetchStaff.map((staffItem) => {
            return staffItem.FirstName;
          });

          const timesheetresponse = {
            ProjectName: ProjectName,
            StaffName: StaffName,
            ...item.toObject(),
          };

          return timesheetresponse;
        })
      );
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: timesheetfetchdata });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = projectCtr;
