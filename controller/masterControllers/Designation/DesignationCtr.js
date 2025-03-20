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
      const {search, page = 1, limit = 10} = req.query; // Default page=1, limit=10

      // Convert pagination parameters to integers
      const parsedPage = Math.max(1, parseInt(page));
      const parsedLimit = Math.max(1, parseInt(limit));
      const skip = (parsedPage - 1) * parsedLimit;

      // Check user authentication
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Sign up.");
      }

      // Check if the company exists
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Query object for MongoDB
      let query = {CompanyId: checkcompany.Company_Id};

      // Search filter: Case-insensitive search by `DesignationName` or `Department_Name`
      if (search) {
        query.$or = [{Designation_Name: {$regex: search, $options: "i"}}];
      }

      // Fetch designations with pagination and sorting
      const response = await Designation.find(query)
        .skip(skip)
        .limit(parsedLimit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total designations for pagination
      const totalCount = await Designation.countDocuments(query);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        page: parsedPage,
        limit: parsedLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / parsedLimit),
      });
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
      const removedesignation = await Designation.findOne({
        Designation_Id: req.params.id,
      });

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

      const desingationedit = await Designation.findOne({
        Designation_Id: req.params.id,
      });

      if (!desingationedit) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("desingation Not Found for updation");
      } else {
        await desingationedit.updateOne({
          $set: {Designation_Name: req.body.Designation_Name},
        });
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
