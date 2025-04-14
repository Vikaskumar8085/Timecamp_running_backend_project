const asyncHandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const WeekoffSetting = require("../../../models/MasterModels/Weekofsetting/WeekofSetting");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");

const weekoffdaysCtr = {
  // add week off day
  createweekoffday: asyncHandler(async (req, res) => {
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

      const {AllowbacklogEntryOnWeekOff, Week_Off_Days} = req.body;

      if (
        AllowbacklogEntryOnWeekOff &&
        (!Array.isArray(Week_Off_Days) || Week_Off_Days.length === 0)
      ) {
        return res
          .status(400)
          .json({error: "Week_Off_Days is required when backlog is allowed."});
      }
      const repsonse = await WeekoffSetting({
        CompanyId: checkcompany.Company_Id,
        AllowbacklogEntryOnWeekOff,
        Week_Off_Days,
      });
      if (!repsonse) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Week off day Not found");
      } else {
        await repsonse.save();
      }
      return res
        .status(HttpStatusCodes.CREATED)
        .json({message: "Item Created SuccessFully", success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch week off days
  fetchweekoffdays: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User. Please sign up.");
      }

      const checkcompany = await Company.findOne({UserId: user.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not Found");
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search || "";

      let queryObj = {
        CompanyId: checkcompany.Company_Id,
      };

      if (search.trim()) {
        queryObj.Week_Off_Days = {$regex: search, $options: "i"};
      }

      const [response, totalcount] = await Promise.all([
        WeekoffSetting.find(queryObj)
          .sort({createdAt: -1})
          .skip(skip)
          .limit(limit),
        WeekoffSetting.countDocuments(queryObj),
      ]);

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Items not found");
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        currentPage: page,
        totalItems: totalcount,
        totalPages: Math.ceil(totalcount / limit),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // update data
  updateweekoffdays: asyncHandler(async (req, res) => {
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

      // response

      const response = await WeekoffSetting.findOne({
        WeekoffSetting_Id: parseInt(req.params.id),
      });
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Item Not Found");
      } else {
        await response.updateOne({$set: {...req.body}}, {new: true});
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: "Item updated successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  removeweekoffdays: asyncHandler(async (req, res) => {
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
      // remove week off days
      const response = await WeekoffSetting.findOne({
        WeekoffSetting_Id: parseInt(req.params.id),
      });
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Item Not Found");
      } else {
        await response.deleteOne();
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: "Item deleted successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = weekoffdaysCtr;
