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

      let QueryObj = {};

      QueryObj = {
        CompanyId: checkcompany.Company_Id,
      };

      const response = await Department.find(QueryObj).lean().exec();

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
      const removedepartment = await Department.findById({
        Department_Id: req.params.id,
      });

      if (!removedepartment) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Department Not Found for deletion");
      } else {
        await removedepartment.deleteOne();
        return res
          .status(StatusCodes.OK)
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

      const editdepartment = await Department.findByIdAndUpdate(
        {Department_Id: req.params.id},
        req.body,
        {runValidator: true, new: true}
      );

      if (!editdepartment) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Department Not Found for updation");
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
