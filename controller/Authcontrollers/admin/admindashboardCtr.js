const asynchandler = require("express-async-handler");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const Client = require("../../../models/AuthModels/Client/Client");
const Project = require("../../../models/Othermodels/Projectmodels/Project");

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
        CompanyId: checkcompany.Company_Id,
      });
      const projectcount = await Project.find({
        CompanyId: company.Company_Id,
      });
      console.log(projectcount);
      console.log(clientcount);
      console.log(staffcount.length);
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = admindashboardCtr;
