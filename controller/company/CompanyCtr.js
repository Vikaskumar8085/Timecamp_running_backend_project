const asynchandler = require("express-async-handler");
const Company = require("../../models/Othermodels/Companymodels/Company");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");

const companyCtr = {
  // create company
  create_company: asynchandler(async (req, res) => {
    try {
      // user authentication
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please login first");
      }

      const response = await Company({
        Company_Name: req.body.Company_Name,
        Company_Email: req.body.Company_Email,
        Address: req.body.Address,
        Postal_Code: req.body.Postal_Code,
        Phone: req.body.Phone,
        Company_Logo: req.body.Company_Logo,
        Employee_No: req.body.Employee_No,
        Established_date: req.body.Established_date,
        CompanyWesite: req.body.CompanyWesite,
        Tex_Number: req.body.Tex_Number,
        UserId: user?.user_id,
      });
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      } else {
        await response.save();
      }
      return res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: "company created successfully",
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch company
  fetch_company: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please login first");
      }
      const response = await Company.findOne({UserId: user.user_id});
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  editcompany: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please login first");
      }
      const response = await Company.findOne({UserId: user.user_id});
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = companyCtr;
