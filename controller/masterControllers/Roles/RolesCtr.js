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
      const {search, page = 1, limit = 10} = req.query; // Default: page=1, limit=10

      // Convert pagination parameters to integers
      const parsedPage = Math.max(1, parseInt(page)); // Ensure page is at least 1
      const parsedLimit = Math.max(1, parseInt(limit)); // Ensure limit is at least 1
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

      // Search filter: Case-insensitive search by `RoleName`
      if (search) {
        query.RoleName = {$regex: search, $options: "i"};
      }

      // Fetch roles with pagination and sorting
      const response = await Role.find(query)
        .skip(skip)
        .limit(parsedLimit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total roles for pagination
      const totalCount = await Role.countDocuments(query);

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

      const removerole = await Role.findOne({RoleId: req.params.id});
      console.log(removerole, "????????//");
      if (!removerole) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Role does not found for deletion");
      } else {
        await removerole.deleteOne();
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "role successfully deleted",
      });
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

      const editRole = await Role.findOne({RoleId: req.params.id});

      if (!editRole) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Role Not Found for updation");
      } else {
        await editRole.updateOne({$set: {RoleName: req.body.RoleName}});
      }
      return res.status(HttpStatusCodes.OK).json({
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
