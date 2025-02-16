const asyncHandler = require("express-async-handler");
const Client = require("../../../models/AuthModels/Client/Client");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const bcrypt = require("bcryptjs");
const Project = require("../../../models/Othermodels/Projectmodels/Project");

const clientCtr = {
  // create client
  create_client: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      req.body.Password = req.body.Client_Phone;

      console.log(req.body.Password, "this is the client password");

      const genhash = await bcrypt.genSalt(12);
      const hashpassword = await bcrypt.hash(req.body.Password, genhash);

      console.log(company, "comapny data");

      const addItem = await Client({
        Company_Name: req.body.Company_Name,
        Client_Name: req.body.Client_Name,
        Client_Email: req.body.Client_Email,
        Client_Phone: req.body.Client_Phone,
        Client_Postal_Code: req.body.Client_Postal_Code,
        Client_Address: req.body.Client_Address,
        Password: hashpassword,
        GstNumber: req.body.GstNumber,
        System_Access: req.body.System_Access,
        Common_Id: company?.Company_Id,
      });
      if (addItem) {
        await addItem.save();
        return res
          .status(200)
          .json({ success: true, message: "successfully client added" });
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch clients
  fetch_client: asyncHandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        Common_Id: company?.Company_Id,
        Role: "Client",
      };
      const response = await Client.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch active client

  // fetch clients
  fetch_active_client: asyncHandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        Common_Id: company?.Company_Id,
        Client_Status: "Active",
        Role: "Client",
      };
      const response = await Client.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // In active client

  fetch_inactive_client: asyncHandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        Common_Id: company?.Company_Id,
        Client_Status: "InActive",
        Role: "Client",
      };
      const response = await Client.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // dead client
  fetch_dead_client: asyncHandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        Common_Id: company?.Company_Id,
        Client_Status: "Dead",
        Role: "Client",
      };
      const response = await Client.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetch_single_client: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      // response
      const response = await Client.findOne({ Client_Id: req.params.id })
        .lean()
        .exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch client projects

  fetch_client_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        clientId: req.params.id,
        CompanyId: company.Company_Id,
      };
      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project Not Found");
      }

      return res.status(HttpStatusCodes.OK).json({
        message: "fetch successfully client projects",
        success: true,
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetch_client_Timesheets: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // check company
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      // const getClient = await Client.find({Email:})
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = clientCtr;
