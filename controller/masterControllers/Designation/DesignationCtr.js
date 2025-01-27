const asynchandler = require("express-async-handler");
const Designation = require("../../../models/MasterModels/Designation/Designation");

const DesignationCtr = {
  // designation created successfully
  create_designation: asynchandler(async (req, res) => {
    try {
      const response = await Designation(req.body);
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
      const response = await Designation.find().lean().exec();

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
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //  update designation
  update_designation: asynchandler(async (req, res) => {
    try {
      const {id} = req.params;
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = DesignationCtr;
