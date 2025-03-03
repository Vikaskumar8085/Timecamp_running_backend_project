const asyncHandler = require("express-async-handler");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Roles = require("../../models/MasterModels/Roles/Roles");
const Client = require("../../models/AuthModels/Client/Client");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
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
  fetchmanagerActiveprojects: asyncHandler(async (req, res) => {
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
          { Client_Id: responseClientId }, // Ensure we update the correct client
          { $set: { Client_Status: "Active" } } // Set Client_Status to Active
        );
      }
      const projectId = createproject?.ProjectId;
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
      }

      let responseProjectmangerid = newProject.Project_ManagersId;
      if (!responseProjectmangerid) {
        return;
      } else {
        await StaffMember.updateOne(
          { staff_Id: responseProjectmangerid },
          { $set: { IsActive: "Active" } }
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

      let updatestaffmember = await Promise.all(
        roleResources?.map(({ RRId, RId }) =>
          StaffMember.updateOne(
            { staff_Id: RRId },
            { $set: { IsActive: "Active" } }
          )
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

module.exports = managerCtr;
