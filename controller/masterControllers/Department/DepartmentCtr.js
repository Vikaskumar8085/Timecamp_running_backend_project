const asyncHandler = require("express-async-handler");
const Department = require("../../../models/MasterModels/Department/Department");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");

const DepartmentCtr = {
  //   create department
  create_department: asyncHandler(async (req, res) => {
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
      console.log(checkcompany);

      // create department

      const response = await Department({
        CompanyId: checkcompany.Company_Id,
        Department_Name: req.body.Department_Name,
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
        message: "department created successfully",
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   fetch department

  fetch_department: asyncHandler(async (req, res) => {
    try {
      // Check user
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Signup.");
      }

      // Check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Search filter
      let searchQuery = {};
      if (req.query.search) {
        searchQuery = {
          $or: [{Department_Name: {$regex: req.query.search, $options: "i"}}],
        };
      }

      // Main query
      const queryObj = {
        CompanyId: checkcompany.Company_Id,
        ...searchQuery, // Merge search filters
      };

      // Fetch departments with pagination
      const response = await Department.find(queryObj)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total departments for pagination
      const totalCount = await Department.countDocuments(queryObj);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   remove department

  remove_department: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error("Un authorized user Please Signup");
      }
      // check company
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("company does not exists please create your company");
      }

      // deleted
      const removedepartment = await Department.findOne({
        Department_Id: req.params.id,
      });
      console.log(removedepartment, "??????????/");

      if (!removedepartment) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Department Not Found for deletion");
      } else {
        await removedepartment.deleteOne();
        return res
          .status(HttpStatusCodes.OK)
          .json({message: "department deleted successfully", success: true});
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  update_departement: asyncHandler(async (req, res) => {
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

      const editdepartment = await Department.findOne({
        Department_Id: req.params.id,
      });

      if (!editdepartment) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Department Not Found for updation");
      } else {
        await editdepartment.updateOne({
          $set: {Department_Name: req.body.Department_Name},
        });
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({message: "department updated successfully", success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = DepartmentCtr;
