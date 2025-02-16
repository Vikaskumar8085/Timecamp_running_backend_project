const asynchandler = require("express-async-handler");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const Client = require("../../../models/AuthModels/Client/Client");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");

const admindashboardCtr = {
  fetchtotalCounter: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({ UserId: user?.user_id });
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

      const resp = {
        projectNo: projectcount.length,
        clientNo: clientcount.length,
        staffNo: staffcount.length,
      };

      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: resp });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = admindashboardCtr;
