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
      Project,
      Project_Code,
      Milestone,
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

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      console.log(checkcompany);

      // Create a new task instance
      const newTask = new Task({
        Company_Id: checkcompany?.Company_Id,
        Task_Name,
        Project,
        Project_Code,
        Milestone,
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
        .json({message: "Task created successfully", task: savedTask});
      const response = await Task(req.body);

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      } else {
        await repsonse.save();
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
};
module.exports = TaskCtr;
