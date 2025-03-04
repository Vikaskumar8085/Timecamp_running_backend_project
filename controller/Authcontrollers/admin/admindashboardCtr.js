const asynchandler = require("express-async-handler");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const Client = require("../../../models/AuthModels/Client/Client");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");

const admindashboardCtr = {
  fetchtotalCounter: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      // staff count
      const staffcount = await StaffMember.find({
        CompanyId: checkcompany.Company_Id,
      });

      //   client count
      const clientcount = await Client.find({
        Common_Id: checkcompany.Company_Id,
      });
      const projectcount = await Project.find({
        CompanyId: checkcompany.Company_Id,
      });
      const approvedTimesheets = await TimeSheet.find({
        CompanyId: checkcompany.Company_Id,
        approval_status: "APPROVED",
      });

      const totalHours = approvedTimesheets.reduce(
        (sum, entry) => sum + (parseInt(entry.hours) || 0),
        0
      );

      console.log("Total Approved Work Hours:", totalHours);

      const resp = {
        projectNo: projectcount.length,
        clientNo: clientcount.length,
        staffNo: staffcount.length,
        totalHours: totalHours,
      };

      return res.status(HttpStatusCodes.OK).json({success: true, result: resp});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchrecentproject: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        CompanyId: checkcompany?.Company_Id,
      };
      const response = await Project.find(queryObj)
        .sort({createdAt: -1})
        .limit(5)
        ?.select("Project_Name Start_Date End_Date");

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Recent Project Not Found");
      }

      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),


};

module.exports = admindashboardCtr;
