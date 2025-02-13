const asynchandler = require("express-async-handler");
const Task = require("../../models/Othermodels/Task/Task");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const Company = require("../../models/Othermodels/Companymodels/Company");
const TaskCtr = {
  // create tasks

  create_task: asynchandler(async (req, res) => {
    const {
      Task_Name,
      ProjectId,
      Project_Code,
      MilestoneId,
      Priority,
      StartDate,
      EndDate,
      Status,
      Estimated_Time,
      Due_date,
      Completed_time,
      Resource_Email,
      Task_description,
      Attachment,
      Description,
    } = req.body;

    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company

      const checkcompany = await Company.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      console.log(checkcompany);

      // Create a new task instance
      const newTask = new Task({
        Company_Id: checkcompany?.Company_Id,
        Task_Name,
        ProjectId,
        Project_Code,
        MilestoneId,
        Priority,
        StartDate,
        EndDate,
        Status,
        Estimated_Time,
        Due_date,
        Completed_time,
        Resource_Email,
        Task_description,
        Attachment,
        Description,
      });

      // Save the task to the database
      const savedTask = await newTask.save();
      res
        .status(201)
        .json({ message: "Task created successfully", task: savedTask });
      const response = await Task(req.body);

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      } else {
        await response.save();
      }

      return res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: "task Created successfully",
        result: response,
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
      const checkcompany = await Company.findOne({ UserId: user?.user_id });
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
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: response });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = TaskCtr;

// {
//   "Company_Id": 1,
//   "Task_Name": "Design Homepage",
//   "ProjectId": 101,
//   "Project_Code": "PROJ001",
//   "MilestoneId": "MILE001",
//   "Priority": "HIGH",
//   "StartDate": "2024-02-12",
//   "EndDate": "2024-02-20",
//   "Status": "INPROGRESS",
//   "Estimated_Time": 20,
//   "Task_description": "Create homepage design",
//   "Resource_Email": "developer@example.com"
// }
