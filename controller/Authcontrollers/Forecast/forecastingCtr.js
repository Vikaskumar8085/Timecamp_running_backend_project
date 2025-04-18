const asynchandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Company = require("../../../models/Othermodels/Companymodels/Company");

const forecastingCtr = {
  generateforecastingReports: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized user please login");
      }
      const checkcompany = await Company.findOne({UserId: user.user_Id});
      if (checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not found");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  projectforecastingReports: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized user please login");
      }
      const checkcompany = await Company.findOne({UserId: user.user_Id});
      if (checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not found");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = forecastingCtr;
