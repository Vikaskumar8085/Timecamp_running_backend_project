const asynchandler = require("express-async-handler");
const Task = require("../../models/Othermodels/Task/Task");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const TaskCtr = {
  // create tasks

  create_task: asynchandler(async (req, res) => {
    try {
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
