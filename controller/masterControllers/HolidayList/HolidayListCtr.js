const asyncHandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const Holidaylist = require("../../../models/MasterModels/HolidayList/HolidayList");
const moment = require("moment");
const HolidayListCtr = {
  createHoliday: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Login");
      }

      const checkcompany = await Company.findOne({UserId: user.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not found");
      }

      const response = await Holidaylist({
        Company_Id: checkcompany?.Company_Id,
        date: moment(req.body.date).format("DD/MM/YYYY"),
        Name: req.body.Name,
      });

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Holiday Not found");
      } else {
        await response.save();
      }
      return res
        .status(HttpStatusCodes.CREATED)
        .json({success: true, message: "Holiday Created Successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchHoliday: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Login");
      }

      const checkcompany = await Company.findOne({UserId: user.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not found");
      }
      //   pagination

      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      let skip = (page - 1) * limit;
      // pagination
      //   searching
      const search = req.query.search || "";

      let queryObj = {};

      queryObj = {
        Company_Id: checkcompany.Company_Id,
      };

      if (search.trim()) {
        queryObj.$or = [{Name: {$regex: search, $options: "i"}}];
      }
      // searching
      const response = await Holidaylist.aggregate([
        {
          $match: queryObj,
        },
        {$sort: {createdAt: -1}},
        {$skip: skip},
        {$limit: limit},
      ]);

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Holiday Not found");
      }

      const totalCount = Holidaylist.countDocuments(response);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        totalItem: totalCount,
        currentPage: page,
        tatalPage: Math.ceil(totalCount / limit),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = HolidayListCtr;
