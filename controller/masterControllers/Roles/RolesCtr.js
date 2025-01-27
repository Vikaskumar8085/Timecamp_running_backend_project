const asyncHandler = require("express-async-handler");
const Role = require("../../../models/MasterModels/Roles/Roles");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");

const RolesCtr = {
  // create roles
  create_roles: asyncHandler(async (req, res) => {
    try {
      const response = await Role(req.body);
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
      const response = await Role.find().lean().exec();
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
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   update roles
  update_roles: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = RolesCtr;
