const asyncHandler = require("express-async-handler");
const Client = require("../../models/AuthModels/Client/Client");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");

const clientdashctr = {
  clientdashcounter: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user).lean().exec();
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User !Please Sign up");
      }
      const projectcount = await Project.find({
        clientId: user?.Client_Id,
      });
      const projectids = await projectcount.map((item) => item.ProjectId);

      const approvedTimesheets = await TimeSheet.find({
        project: {$in: projectids},
        approval_status: "APPROVED",
      });

      const totalHours = approvedTimesheets.reduce(
        (sum, entry) => sum + (parseInt(entry.hours) || 0),
        0
      );
      const result = {
        totalproject: projectcount.length,
        totalHours: totalHours,
      };
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  clientdashboardRecentProject: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please signup");
      }

      const findProjects = await Project.find({clientId: user?.Client_Id});

      if (findProjects.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project not found");
      }

      const result = {
        ProjectName: findProjects.map((item) => item.Project_Name),
        startdata: findProjects.map((item) => item.Start_Date),
        enddata: findProjects.map((item) => item.End_Date),
      };

      return res.status(HttpStatusCodes.OK).json({success: true, result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = clientdashctr;
