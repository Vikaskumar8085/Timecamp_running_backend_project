const asynchandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const bcrypt = require("bcryptjs");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const moment = require("moment");

const contractorCtr = {
  // create contractor
  create_contractor: asynchandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      req.body.Password = req.body.Phone;

      const genhash = await bcrypt.genSalt(12);
      const hashpassword = await bcrypt.hash(req.body.Password, genhash);

      // const formattedDate = moment(req.body.Joining_Date).format("YYYY-MM-DD");
      // create contractor
      const response = await StaffMember({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Address: req.body.Address,
        Password: hashpassword,
        Joining_Date: moment(req.body.Joining_Date).format("YYYY-MM-DD"),
        DesignationId: req.body.DesignationId,
        ManagerId: req.body.ManagerId,
        Permission: req.body.Permission,
        Backlog_Entries: req.body.Backlog_Entries,
        Socail_Links: req.body.Socail_Links,
        Contractor_Company: req.body.Contractor_Company,
        Hourly_Rate: req.body.Hourly_Rate,
        Supervisor: req.body.Supervisor,
        Role: "Contractor",
        CompanyId: company.Company_Id,
      });

      await response.save();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad request");
      }

      return res.status(HttpStatusCodes.CREATED).json({
        message: "Contractor created Successfully",
        success: true,
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   fetch controactor
  fetch_all_contractor: asynchandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: "Contractor",
      };
      const response = await StaffMember.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad request");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   active contractor
  fetch_active_contractor: asynchandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: "Contractor",
        IsActive: "Active",
      };
      const response = await StaffMember.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad request");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }),

  //   in active contractor
  fetch_inactive_contractor: asynchandler(async (req, res) => {
    try {
      // check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: "Contractor",
        IsActive: "InActive",
      };
      const response = await StaffMember.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad request");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch by id contractor

  fetch_single_contractor: asynchandler(async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({ UserId: user?.user_id });
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const response = await StaffMember.findOne({ staff_Id: parseInt(id) })
        .lean()
        .exec();
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Not Found");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetch_contractor_projects: asynchandler(async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(req.user).lean().exec();
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkcompany = await Company.findOne({ UserId: user.user_id })
        .lean()
        .exec();
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }

      let queryObj = {};

      const response = await Project.find(queryObj).lean().exec();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad Requests");
      }
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
        message: "fetch contractor data successfully",
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = contractorCtr;
