const asynchandler = require("express-async-handler");
const Task = require("../../models/Othermodels/Task/Task");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const Milestone = require("../../models/Othermodels/Milestones/Milestones");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const Notification = require("../../models/Othermodels/Notification/Notification");
const TaskCtr = {
  // create tasks
  create_task: asynchandler(async (req, res) => {
    try {
      console.log(req.body, "/");
      const {id} = req.params;
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized User. Please Signup.",
        });
        return; // Ensure no further code runs after sending the response
      }

      // Check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
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
        await new Notification({
          SenderId: user?.user_id,
          ReciverId: newTask?.Resource_Id,
          Name: user?.FirstName,
          Description: "You have been allotted a new task by the admin",
          IsRead: false,
        }).save();
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
  addTask: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized User. Please Signup.",
        });
        return; // Ensure no further code runs after sending the response
      }

      // Check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
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
      await newTask.save();
      res.status(201).json({
        message: "Task created successfully",
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch task by project
  fetchprojectask: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        ProjectId: req.params.id,
        Company_Id: checkcompany.Company_Id,
      };

      const response = await Task.find(queryObj).lean().exec();

      const projectsdata = await Promise.all(
        response.map(async (item) => {
          const fetchproject = await Project.find({ProjectId: item?.ProjectId});

          const fetchResourcesName = await StaffMember.find({
            staff_Id: item.Resource_Id,
          });

          const fetchMilestone = await Milestone.find({
            Milestone_id: item.MilestoneId,
          });

          const ProjectName = fetchproject.map((proj) => proj.Project_Name);
          const ResourceName = fetchResourcesName.map((res) => res.FirstName);
          const MilestoneName = fetchMilestone.map((mile) => mile.Name);

          return {
            ...item,
            ProjectName,
            ResourceName,
            MilestoneName,
          };
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: projectsdata});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchTasks: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        Company_Id: checkcompany.Company_Id,
      };

      const response = await Task.find(queryObj).lean().exec();

      const projectsdata = await Promise.all(
        response.map(async (item) => {
          const fetchproject = await Project.find({ProjectId: item?.ProjectId});

          const fetchResourcesName = await StaffMember.find({
            staff_Id: item.Resource_Id,
          });

          const fetchMilestone = await Milestone.find({
            Milestone_id: item.MilestoneId,
          });

          const ProjectName = fetchproject.map((proj) => proj.Project_Name);
          const ResourceName = fetchResourcesName.map((res) => res.FirstName);
          const MilestoneName = fetchMilestone.map((mile) => mile.Name);

          return {
            ...item,
            ProjectName,
            ResourceName,
            MilestoneName,
          };
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: projectsdata});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchProjectwithmilestones: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
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
};
module.exports = TaskCtr;
