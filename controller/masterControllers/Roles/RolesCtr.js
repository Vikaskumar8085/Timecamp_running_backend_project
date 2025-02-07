const asyncHandler = require("express-async-handler");
const Role = require("../../../models/MasterModels/Roles/Roles");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");

const RolesCtr = {
  // create roles
  create_roles: asyncHandler(async (req, res) => {
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
      const response = await Role({
        CompanyId: checkcompany.Company_Id,
        RoleName: req.body.RoleName,
      });
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      } else {
        await response.save();
      }
      return res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: "role created Successfully",
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   fetch roles
  fetch_roles: asyncHandler(async (req, res) => {
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

      const response = await Role.find({
        CompanyId: checkcompany.Company_Id,
      })
        .lean()
        .exec();
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

  //   remove roles
  remove_roles: asyncHandler(async (req, res) => {
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

      const removerole = await Role.findById({Role_Id: req.params.id});
      if (!removerole) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Role does not found for deletion");
      } else {
        await removerole.deleteOne();

        return res.status(HttpStatusCodes.OK).json({
          success: true,
          message: "role successfully deleted",
          result: removerole,
        });
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   update roles
  update_roles: asyncHandler(async (req, res) => {
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

      const editRole = await Role.findByIdAndUpdate(
        {Role_Id: req.params.id},
        req.body,
        {runValidator: true, new: true}
      );

      if (!editRole) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Role Not Found for updation");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({
          success: true,
          message: "role successfully updated",
          result: editRole,
        });
    } catch (error) {
      throw new Error(error.message);
    }
  }),
};

module.exports = RolesCtr;
