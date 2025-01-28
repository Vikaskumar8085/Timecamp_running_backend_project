const asynchandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");

const contractorCtr = {
  // create contractor
  create_contractor: asynchandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      // create contractor
      const response = await StaffMember({});

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad request");
      }

      return res.status(HttpStatusCodes.CREATED).json({
        message: "Contractor created Successfully",
        success: true,
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   fetch controactor
  fetch_all_contractor: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   active contractor
  fetch_active_contractor: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error.message);
    }
  }),

  //   in active contractor
  fetch_inactive_contractor: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = contractorCtr;
