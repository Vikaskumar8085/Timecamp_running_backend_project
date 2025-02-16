const asyncHandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const bcrypt = require("bcryptjs");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const moment = require("moment");

const employeeCtr = {
  // create employee
  create_employee: asyncHandler(async (req, res) => {
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

      // create Employee
      const response = await StaffMember({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Address: req.body.Address,
        Password: hashpassword,
        Joining_Date: moment(req.body.Joining_Date).format("YYYY-MM-DD"),
        DesignationId: req.body.DesignationId,
        Backlog_Entries: req.body.Backlog_Entries,
        Socail_Links: req.body.Socail_Links,
        Permission: req.body.Permission,
        ManagerId: req.body.ManagerId,
        Role: "Employee",
        CompanyId: company.Company_Id,
      });

      await response.save();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad request");
      }

      return res.status(HttpStatusCodes.CREATED).json({
        message: "Employee created Successfully",
        success: true,
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch employee
  fetch_employee: asyncHandler(async (req, res) => {
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
        Role: "Employee",
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

  //   fetch active employee
  fetch_active_employee: asyncHandler(async (req, res) => {
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
        Role: "Employee",
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
      throw new Error(error?.message);
    }
  }),

  //   fetch inactive emplloyee
  fetch_inactive_employee: asyncHandler(async (req, res) => {
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
        Role: "Employee",
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

  fetch_single_employee: asyncHandler(async (req, res) => {
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
        message: "fetch successfully Employee",
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetch_employee_projects: asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please singup");
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

  fetch_staff: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please singup");
      }
      const checkcompany = await Company.findOne({ UserId: user.user_id })
        .lean()
        .exec();
      if (!checkcompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }

      let queryObj = {
        CompanyId: checkcompany.Company_Id,
      };

      const response = await StaffMember.find(queryObj).lean().exec();

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
};

module.exports = employeeCtr;
