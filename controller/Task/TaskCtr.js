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

      let attachmentPath = req.file ? req.file.filename : Attachment;
      let uploadPath = "uploads/";

      // Get file extension
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      console.log(fileExt, "reqogsdfisdfl");

      // Define subfolders based on file type
      if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
        uploadPath += "documents/";
      } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)) {
        uploadPath += "images/";
      } else if (file.mimetype === "text/csv") {
        uploadPath += "csv/";
      } else {
        uploadPath += "others/"; // Fallback folder
      }

      console.log(uploadPath, "upload path");

      const taskattachment = attachmentPath
        ? `${req.protocol}://${req.get("host")}/${uploadPath}/${attachmentPath}`
        : null;

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
        Attachment: taskattachment,
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
      let uploadPath = "uploads/";

      // Get file extension
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      console.log(fileExt, "reqogsdfisdfl");

      // Define subfolders based on file type
      if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
        uploadPath += "documents/";
      } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)) {
        uploadPath += "images/";
      } else if (file.mimetype === "text/csv") {
        uploadPath += "csv/";
      } else {
        uploadPath += "others/";
      }

      console.log(uploadPath, "upload path");

      const taskattachmentfile = attachmentPath
        ? `${req.protocol}://${req.get("host")}/${uploadPath}/${attachmentPath}`
        : null;

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
        Attachment: taskattachmentfile,
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
        throw new Error("Unauthorized User. Please Sign Up.");
      }

      // Check if the company exists
      const checkCompany = await Company.findOne({UserId: user?.user_id});
      if (!checkCompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Extract query parameters for search and pagination
      const {search = "", page = 1, limit = 10} = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Construct search query
      let queryObj = {Company_Id: checkCompany.Company_Id};

      if (search) {
        queryObj["Task_Name"] = {$regex: search, $options: "i"}; // Case-insensitive search
      }

      // Fetch total count for pagination metadata
      const totalCount = await Task.countDocuments(queryObj);

      // Fetch paginated tasks
      const tasks = await Task.find(queryObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Fetch related data in parallel to improve performance
      const projectsData = await Promise.all(
        tasks.map(async (task) => {
          const [fetchProject, fetchResources, fetchMilestone] =
            await Promise.all([
              Project.findOne({ProjectId: task?.ProjectId}),
              StaffMember.findOne({staff_Id: task?.Resource_Id}),
              Milestone.findOne({Milestone_id: task?.MilestoneId}),
            ]);

          return {
            ...task,
            ProjectName: fetchProject?.Project_Name || "N/A",
            ResourceName: fetchResources?.FirstName || "N/A",
            MilestoneName: fetchMilestone?.Name || "N/A",
          };
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: projectsData,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      });
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
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
  // fetch task info
  fetchTaskInfo: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
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
};
module.exports = TaskCtr;
