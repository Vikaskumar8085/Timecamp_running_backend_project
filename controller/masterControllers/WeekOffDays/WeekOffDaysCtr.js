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

      const repsonse = await WeekoffSetting({
        CompanyId: checkcompany.Company_Id,
        ...req.body,
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
        throw new Error("Un Authorized User please sign up");
      }

      const checkcompany = await Company.findOne({UserId: user.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not Found");
      }

      let queryObj = {};
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      let skip = (page - 1) * limit;
      let search = req.query.search || "";
      queryObj = {
        CompanyId: checkcompany.Company_Id,
      };
      if (search.trim()) {
        queryObj.$or = [{Week_Off_Days: {$regex: search, $options: "i"}}];
      }

      const response = await WeekoffSetting.aggregate([
        {$match: queryObj},
        {
          $limit: limit,
        },
        {
          $skip: skip,
        },
        {$sort: {createdAt: -1}},
      ]);

      const totalcount = WeekoffSetting.countDocuments(response);
      if (!response || response.length == 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("item Not found");
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        currentpage: page,
        totalItem: totalcount,
        totalpage: Math.ceil(totalcount / limit),
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
