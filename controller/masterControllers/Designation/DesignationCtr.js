const asynchandler = require("express-async-handler");
const Designation = require("../../../models/MasterModels/Designation/Designation");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Company = require("../../../models/Othermodels/Companymodels/Company");

const DesignationCtr = {
  // designation created successfully
  create_designation: asynchandler(async (req, res) => {
    try {
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

      const response = await Designation({
        CompanyId: checkcompany?.Company_Id,
        Designation_Name: req.body.Designation_Name,
      });
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      } else {
        await response.save();
      }

      return res.status(HttpStatusCodes.CREATED).json({
        success: true,
        result: response,
        message: "designation created successfully",
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch designation
  fetch_designation: asynchandler(async (req, res) => {
    try {
      const {search, filter, page = 0, limit = 10} = req.query; // Default skip=0, limit=10

      // pagination
      const parsedSkip = parseInt(page - 1);
      const parsedLimit = parseInt(limit);

      // pagination

      let query = {};

      // Search functionality - case-insensitive regex for department name and description
      if (search) {
        query.$or = [
          {Department_Name: {$regex: search, $options: "i"}}, // Case-insensitive search in departmentName
        ];
      }

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
      query = {CompanyId: checkcompany.Company_Id}; // Ensure the CompanyId is correct

      const response = await Designation.find(query);
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad request");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // remove designation
  remove_designation: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un authorized user Please Signup");
      }
      // check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("company does not exists please create your company");
      }
      const removedesignation = await Designation.findById({
        Designation_Id: req.params.id,
      })
        .lean()
        .exec();
      if (!removedesignation) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Designation does Not Found for deletion");
      } else {
        await removedesignation.deleteOne();
        return res.status(HttpStatusCodes.OK).json({
          message: "designation deleted successfully",
          success: true,
        });
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //  update designation
  update_designation: asynchandler(async (req, res) => {
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

      const desingationedit = await Designation.findByIdAndUpdate(
        {Designation_Id: req.params.id},
        req.body,
        {runValidator: true, new: true}
      );

      if (!desingationedit) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("desingation Not Found for updation");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "desingation successfully updated"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = DesignationCtr;
