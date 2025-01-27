const asynchandler = require("express-async-handler");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");

const adminCtr = {
  create_admin: asynchandler(async (req, res) => {
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
      console.log(checkcompany);

      const createuser = await User(req.body);
      if (!createuser) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("User not found");
      } else {
        await createuser.save();
        await Company.updateOne(
          { Company_Id: checkcompany?.Company_Id },
          { $push: { UserId: createuser.user_id } }
        );
      }

      return res
        .status(HttpStatusCodes.CREATED)
        .json({ success: true, message: "admin created successfully" });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = adminCtr;
