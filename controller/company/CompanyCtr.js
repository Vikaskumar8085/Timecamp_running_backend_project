const asynchandler = require("express-async-handler");
const Company = require("../../models/Othermodels/Companymodels/Company");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");

const companyCtr = {
  // create company
  create_company: asynchandler(async (req, res) => {
    try {
      const response = await Company(req.body);
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
      const response = await Company.find();
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
};

module.exports = companyCtr;
