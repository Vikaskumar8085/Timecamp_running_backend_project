const asyncHandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const Color = require("../../../models/MasterModels/Color/Color");

const ColorCtr = {
  addColor: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized please login");
      }
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      const response = await Color({
        CompnayId: checkcompany?.Company_Id,
        ...req.body,
      });

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Color Not Found");
      }

      await response.save();

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "color successfully created"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   fetch color
  fetchColor: asyncHandler(async (req, res) => {
    try {
      // chcek user
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized User please login");
      }
      //   check company
      const checkcompany = await Company.findOne({UserId: ures.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not found Please Login");
      }

      // pagination
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      let skip = (page - 1) * limit;
      let search = req.query.search || "";

      // pagination
      let queryObj = {};
      queryObj = {
        Company_Id: checkcompany?.Company_Id,
      };
      if (search.trim()) {
        queryObj.$or = [{Name: {$regex: search, $options: "i"}}];
      }

      const response = await Color.aggregate([
        {$match: queryObj},
        {$sort: {createdAt: -1}},
        {$skip: skip},
        {$limit: limit},
      ]);

      const totalcount = await Color.countDocuments(response);

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Color Not Found");
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        totalItem: totalcount,
        currentpage: page,
        totalPage: Math.ceil(totalcount / limit),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = ColorCtr;
