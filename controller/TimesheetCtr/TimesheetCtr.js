const asyncHandler = require("express-async-handler");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const Company = require("../../models/Othermodels/Companymodels/Company");

const TimesheetCtr = {
  // create timesheet
  create_timesheet: asyncHandler(async (req, res) => {
    try {
      const response = await TimeSheet(req.body);
      if (!response) {
        // resturn
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: response });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   fetch timesheet
  fetch_timesheet: asyncHandler(async (req, res) => {
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

      let queryObj = {};

      queryObj = {
        CompanyId: checkcompany.Company_Id,
      };
      const response = await TimeSheet.find(queryObj);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Not Found Timesheet");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: response });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   project timesheet
  
};

module.exports = TimesheetCtr;
