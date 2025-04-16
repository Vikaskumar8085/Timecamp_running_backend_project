const asyncHandler = require("express-async-handler");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Standard = require("../../../models/MasterModels/StandaradHours");

const standardCtr = {
  createstandard: asyncHandler(async (req, res) => {
    try {
      console.log(req.body);
      // check user
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      const response = await Standard({
        Company_Id: checkcompany.Company_Id,
        ...req.body,
      });
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Item Not Found");
      } else {
        await response.save();
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "Item Created Successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchstandard: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const response = await Standard.aggregate([
        {$match: {Company_Id: checkcompany?.Company_Id}},
      ]);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("item Not Found");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({result: response, success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  removestandard: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const response = await Standard.findOne({
        standard_Id: parseInt(req.params.id),
      });

      console.group(response);
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("item Not found");
      } else {
        await response.deleteOne();
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "item deleted successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = standardCtr;
