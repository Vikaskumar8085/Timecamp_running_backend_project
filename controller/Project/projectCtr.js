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
const Notification = require("../../models/Othermodels/Notification/Notification");
const moment = require("moment");
const Task = require("../../models/Othermodels/Task/Task");
const Bucket = require("../../models/Othermodels/Bucket/Bucket");
const generateProjectCode = async () => {
  const lastProject = await Project.findOne().sort({ProjectId: -1});
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
        bucket,
        roleResources,
        roleProjectMangare,
      } = req.body;

      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }
      const checkcompany = await Company?.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      // Create the project
      const newProject = await new Project({
        CompanyId: checkcompany.Company_Id,
        Project_Name,
        clientId,
        Project_Type,
        currency: req.body.currency,
        Project_Hours,
        Project_Status: true,
        Start_Date: moment(req.body.Start_Date).format("DD/MM/YYYY"),
        End_Date: moment(req.body.End_Date).format("DD/MM/YYYY"),
      });

      await newProject.save();

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
            ProjectId: newProject.ProjectId,
            bucketHourly: item.bucketHourly,
            bucketHourlyRate: item.bucketHourlyRate,
          });

          const savedbucket = await bucket.save();
          insertedMilestones.push(savedbucket);
        }
      }
      let responseClientId = newProject.clientId;

      if (!responseClientId) {
        return; // Exit if clientId is undefined or empty
      } else {
        await Client.updateOne(
          {Client_Id: responseClientId}, // Ensure we update the correct client
          {$set: {Client_Status: "Active"}} // Set Client_Status to Active
        );

        await Notification({
          SenderId: user?.user_id,
          ReciverId: newProject?.clientId,
          Name: user?.FirstName,
          Pic: user?.Photo,
          Description: `You have been assigned to the ${Project_Name} project as a new client by the admin.`,
          IsRead: false,
        }).save();
      }

      // Retrieve the generated ProjectId
      const projectId = newProject?.ProjectId;

      // roleProjectManagare
      if (!Array.isArray(roleProjectMangare) || roleProjectMangare.length == 0)
        return;

      let insertProjectManagerdata = [];
      for (let item of roleProjectMangare) {
        const responseitem = new RoleResource({
          RRId: item?.RRId,
          RId: item?.RId,
          ProjectId: projectId,
          IsProjectManager: true,
          Rate: item?.Rate,
          billable: item?.billable,
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
            await Notification.create({
              SenderId: user?.user_id,
              ReciverId: RRId, // Receiver is RRId
              Name: user?.FirstName,
              Pic: user?.Photo,
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

      // role Project Manager

      console.log(roleResources, "role resource data");
      // Exit early if roleResources is not a valid array or is empty
      if (!Array.isArray(roleResources) || roleResources.length === 0) return;

      for (let roleitem of roleResources) {
        await new RoleResource({
          RRId: roleitem?.RRId,
          RId: roleitem?.RId,
          ProjectId: projectId,
          billable: roleitem?.billable,
          Rate: roleitem?.Rate,
          Unit: roleitem?.Unit,
          Engagement_Ratio: roleitem?.Engagement_Ratio,
        }).save();
      }

      try {
        let updatestaffmember = await Promise.all(
          (roleResources || []).map(async ({RRId, RId}) => {
            if (!RRId) return; // Skip invalid entries
            // Update staff member status
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
            await Notification.create({
              SenderId: user?.user_id,
              ReciverId: RRId, // Receiver is RRId
              Name: user?.FirstName,
              Pic: user?.Photo,
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

  // Edit Project

  Edit_Projects: asyncHandler(async (req, res) => {
    try {
      const {ProjectId} = req.params;
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
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized user");
      }

      const checkcompany = await Company.findOne({UserId: user.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      const project = await Project.findOne({ProjectId: ProjectId});
      if (!project) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project not found");
      }

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
        await Bucket.deleteMany({ProjectId: ProjectId});
      } else {
        if (!Array.isArray(bucket)) {
          return res.status(400).json({
            message: "bucket data should be an array.",
          });
        }

        await Bucket.deleteMany({ProjectId: ProjectId});

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
          {Client_Id: clientId},
          {$set: {Client_Status: "Active"}}
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
        IsProjectManager: true,
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
          const staff = await StaffMember.findOne({staff_Id: item.RRId});
          if (staff && staff.IsActive !== "Active") {
            await StaffMember.updateOne(
              {staff_Id: item.RRId},
              {$set: {IsActive: "Active"}}
            );
          }

          await Notification.create({
            SenderId: user.user_id,
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
        IsProjectManager: {$ne: true},
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

          const staff = await StaffMember.findOne({staff_Id: item.RRId});
          if (staff && staff.IsActive !== "Active") {
            await StaffMember.updateOne(
              {staff_Id: item.RRId},
              {$set: {IsActive: "Active"}}
            );
          }

          await Notification.create({
            SenderId: user.user_id,
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

  // remove_Project

  remove_Project: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      const checkcompany = await Company?.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const findproject = await Project.findOne({
        ProjectId: parseInt(req.params.id),
      });
      if (!findproject) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Project Not Found");
      } else {
        await findproject.deleteOne();
      }
      const findProjectInRoleResource = await RoleResource.find({
        ProjectId: parseInt(req.params.id),
      });
      if (!findProjectInRoleResource) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error();
      } else {
        for (let item of findProjectInRoleResource) {
          await item.deleteOne();
        }
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "Project Deleted Successfully"});
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
        throw new Error("Unauthorized User");
      }

      // Check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist, please create a company first"
        );
      }

      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      // Default to page 1 if invalid page or limit values
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;

      // Query object to filter by company
      let queryObj = {
        CompanyId: company.Company_Id,
      };

      // Add search filter (case-insensitive)
      if (search.trim()) {
        queryObj.$or = [
          {Project_Name: {$regex: search, $options: "i"}}, // Case-insensitive search
        ];
      }
      // Fetch total count for pagination
      const totalProjects = await Project.countDocuments(queryObj);

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
      const projectsWithDetails = await Promise.all(
        projects.map(async (project) => {
          const roleResources = await RoleResource.find({
            ProjectId: {$in: project.ProjectId},
            IsProjectManager: false,
          });

          const roleProjectMangare = await RoleResource.find({
            ProjectId: project.ProjectId,
            IsProjectManager: true,
          });
          return {
            ...project,
            roleProjectMangare: roleProjectMangare,
            roleResources: roleResources,
          };
        })
      );

      // Send response with pagination info
      return res.status(HttpStatusCodes.OK).json({
        message: "Projects fetched successfully",
        result: projectsWithDetails,
        totalPages: Math.ceil(totalProjects / limit),
        currentPage: page,
        totalProjects,
        success: true,
      });
    } catch (error) {
      // Handle errors
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      throw new Error(
        error?.message || "An error occurred while fetching projects."
      );
    }
  }),

  fetch_active_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User");
      }

      // Check company
      const company = await Company.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist, please create a company first"
        );
      }

      // Extract query parameters
      let {
        page = 1,
        limit = 10,
        search = "",
        status,
        start_date,
        end_date,
      } = req.query;

      // Parse the page and limit values
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      // Validation for page and limit, ensuring they are positive integers
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;

      // Query object for filtering active projects
      let queryObj = {
        CompanyId: company?.Company_Id,
        Project_Status: true, // Only fetch active projects
      };

      // Apply search filter (case-insensitive search for Project_Name)
      if (search.trim()) {
        queryObj.Project_Name = {$regex: search, $options: "i"}; // Case-insensitive search
      }

      // Apply additional status filter if provided
      if (status) {
        queryObj.Project_Status = status === "true"; // Handle boolean value for status
      }

      // Apply Start Date & End Date filter using Moment.js
      if (start_date || end_date) {
        queryObj.Start_Date = {};
        if (start_date) {
          queryObj.Start_Date.$gte = moment(start_date, "DD/MM/YYYY")
            .startOf("day")
            .toDate();
        }
        if (end_date) {
          queryObj.Start_Date.$lte = moment(end_date, "DD/MM/YYYY")
            .endOf("day")
            .toDate();
        }
      }

      // Fetch total count for pagination
      const totalProjects = await Project.countDocuments(queryObj);

      // Fetch paginated projects
      const projects = await Project.find(queryObj)
        .skip((page - 1) * limit) // Skipping the previous records
        .limit(limit) // Limiting the number of projects per page
        .lean()
        .exec();

      if (!projects.length) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("No active projects found");
      }

      // Format project start and end dates in response
      const formattedProjects = projects.map((project) => ({
        ...project,
        Start_Date: moment(project.StartDate).format("DD/MM/YYYY"),
        End_Date: moment(project.EndDate).format("DD/MM/YYYY"),
      }));

      // Send response with pagination info
      return res.status(HttpStatusCodes.OK).json({
        message: "Active projects fetched successfully",
        result: formattedProjects,
        totalPages: Math.ceil(totalProjects / limit), // Total number of pages
        currentPage: page, // Current page number
        totalProjects, // Total number of projects
        success: true,
      });
    } catch (error) {
      // Catching and returning errors
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      throw new Error(
        error?.message || "An error occurred while fetching active projects."
      );
    }
  }),

  fetch_inactive_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User");
      }

      // Check company
      const company = await Company.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Extract query parameters
      let {page = 1, limit = 10, search = ""} = req.query;

      // Ensure page and limit are integers and valid
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      // Default to 1 for page and 10 for limit if invalid
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;

      // Query object for filtering inactive projects
      let queryObj = {
        CompanyId: company?.Company_Id,
        Project_Status: false, // Only fetch inactive projects
      };

      // Apply search filter (case-insensitive search for Project_Name)
      if (search.trim()) {
        queryObj.Project_Name = {$regex: search, $options: "i"}; // Case-insensitive search
      }

      // Fetch total count for pagination
      const totalProjects = await Project.countDocuments(queryObj);

      // Fetch paginated projects
      const projects = await Project.find(queryObj)
        .skip((page - 1) * limit) // Skip previous pages
        .limit(limit) // Limit the number of projects per page
        .lean()
        .exec();

      if (!projects.length) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("No inactive projects found");
      }

      // Format project start and end dates in response
      const formattedProjects = projects.map((project) => ({
        ...project,
        StartDate: moment(project.StartDate).format("DD/MM/YYYY"),
        EndDate: moment(project.EndDate).format("DD/MM/YYYY"),
      }));

      // Send the response with pagination info
      return res.status(HttpStatusCodes.OK).json({
        message: "Inactive projects fetched successfully",
        result: formattedProjects,
        totalPages: Math.ceil(totalProjects / limit), // Total pages available
        currentPage: page, // Current page number
        totalProjects, // Total number of inactive projects
        success: true,
      });
    } catch (error) {
      // Return error message for unexpected errors
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      throw new Error(
        error?.message || "An error occurred while fetching inactive projects."
      );
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
      const company = await Company?.findOne({UserId: user?.user_id});
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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const queryObj = {
        CompanyId: company.Company_Id,
        ProjectId: parseInt(req.params.id),
      };

      const response = await Project.findOne(queryObj);
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      // const projectsWithDetails = await Promise.all(
      //   response.map(async (projectitem) => {
      //     const roleResources = await RoleResource.find({
      //       ProjectId: projectitem.ProjectId,
      //     });

      //     // Extract RRId values
      //     const rIds = roleResources.map((rr) => rr.RId);
      //     const roles = await Role.find({RoleId: {$in: rIds}});
      //     const rrid = roleResources.map((rr) => rr.RRId);

      //     const staffMember = await StaffMember.find({
      //       staff_Id: {$in: rrid},
      //     });

      //     const responseclient = await Client.find({
      //       Client_Id: projectitem.clientId,
      //     });
      //     const ProjectManager = await StaffMember.find({
      //       staff_Id: {$in: projectitem.Project_ManagersId},
      //     });
      //     const ProjectManagerName = await ProjectManager.map(
      //       (item) => item.FirstName
      //     );
      //     const ClientName = await responseclient.map(
      //       (item) => item.Client_Name
      //     );
      //     const RoleName = await roles.map((item) => item.RoleName);
      //     const StaffName = await staffMember.map((item) => item.FirstName);

      //     const projectResult = {
      //       ...projectitem,
      //       RoleName,
      //       StaffName,
      //       ClientName,
      //       ProjectManagerName,
      //     };
      //     return projectResult;
      //   })
      // );

      return res.status(HttpStatusCodes.OK).json({
        message: "fetch single projects successfully",
        result: response,
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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {
        CompanyId: company.Company_Id,
        project: parseInt(req.params.id),
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
        .json({success: true, result: timesheetfetchdata});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchprojectinfochart: asyncHandler(async (req, res) => {
    try {
      const user = await User.find(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      const project = await Project.findOne({
        ProjectId: parseInt(req.params.id),
      });
      if (!project) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({error: "Project Not Found"});
      }

      const projectData = await TimeSheet.aggregate([
        {
          $match: {project: project.ProjectId},
        },
        {
          $lookup: {
            from: "staffmembers",
            localField: "Staff_Id",
            foreignField: "staff_Id",
            as: "staff",
          },
        },
        {$unwind: "$staff"}, // Convert staff array to object
        {
          $addFields: {
            hours: {$toDouble: "$hours"}, // Convert hours to Number
            billedHours: {$toDouble: "$billed_hours"}, // Convert billedHours to Number
          },
        },
        {
          $group: {
            _id: "$staff.FirstName",
            totalHours: {$sum: "$hours"},
            totalBilledHours: {$sum: "$billed_hours"},
          },
        },
        {
          $project: {
            _id: 0,
            FirstName: "$_id",
            hours: "$totalHours",
            billedHours: "$totalBilledHours",
          },
        },
      ]);

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "success", result: projectData});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchallotedtaskmemebrs: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      const checkcompany = await Company?.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const response = await Task.aggregate([
        {$match: {ProjectId: parseInt(req.params.id)}},
        {
          $lookup: {
            from: "staffmembers",
            localField: "Resource_Id",
            foreignField: "staff_Id",
            as: "detailsofresponse",
          },
        },
        {
          $unwind: "$detailsofresponse",
        },
        {
          $group: {
            _id: "$detailsofresponse.FirstName", // group by FirstName to remove duplicates
          },
        },
        {
          $project: {
            _id: 0,
            FirstName: "$_id",
          },
        },
      ]);

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = projectCtr;
