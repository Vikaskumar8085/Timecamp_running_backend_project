const asyncHandler = require("express-async-handler");
const User = require("../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const moment = require("moment");

const projectCtr = {
  create_Project: asyncHandler(async (req, res) => {
    try {
      const {
        Project_Name,
        Start_Date,
        End_Date,
        clientId,
        Project_Type,
        Project_Hours,
        Project_Status,
        RoleResource,
        Project_ManagersId,
      } = req.body;

      // check user
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
      console.log(company, "comapny data");

      const formattedStartDate = Start_Date
        ? moment(Start_Date, "DD/MM/YYYY").format("DD/MM/YYYY")
        : moment().format("DD/MM/YYYY");
      const formattedEndDate = End_Date
        ? moment(End_Date, "DD/MM/YYYY").format("DD/MM/YYYY")
        : moment().format("DD/MM/YYYY");

      if (
        !moment(formattedStartDate, "DD/MM/YYYY", true).isValid() ||
        !moment(formattedEndDate, "DD/MM/YYYY", true).isValid()
      ) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error({message: "Invalid date format. Use DD/MM/YYYY."});
      }

      const response = await Project({
        CompanyId: company?.Company_Id,
        Project_Name,
        Start_Date,
        End_Date,
        clientId,
        Project_Type,
        Project_Hours,
        Project_Status,
        RoleResource,
        Project_ManagersId,
      });

      await response.save();

      return res.status(HttpStatusCodes.CREATED).json({
        message: "project created successfully",
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  bulkupload_projects: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = projectCtr;
