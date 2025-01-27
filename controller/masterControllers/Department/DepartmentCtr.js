const asyncHandler = require("express-async-handler");
const Department = require("../../../models/MasterModels/Department/Department");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");

const DepartmentCtr = {
  //   create department
  create_department: asyncHandler(async (req, res) => {
    try {
      const response = await Department(req.body);
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
      const response = await Department.find().lean().exec();

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
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  update_departement: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
