const asyncHandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const bcrypt = require("bcryptjs");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const moment = require("moment");
const {parse} = require("dotenv");
const RoleResource = require("../../../models/Othermodels/Projectmodels/RoleResources");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");

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
      const company = await Company?.findOne({UserId: user?.user_id});
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

      const managerids = await response.ManagerId;
      const checkmanagerids = await StaffMember.findOne({
        staff_Id: managerids,
      });
      if (checkmanagerids) {
        await StaffMember.updateOne(
          {staff_Id: managerids},
          {SubRole: "Manager"}
        );
      }

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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: ["Employee", "Manager"],
      };
      const staffresponse = await StaffMember.find(queryObj).lean().exec();
      if (!staffresponse) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad request");
      }
      const response = await Promise.all(
        staffresponse.map(async (item) => {
          const staffManager = await StaffMember.findOne({
            staff_Id: item.ManagerId,
          });
          return {
            ...item,
            Manager: staffManager?.FirstName || null, // More concise null handling
          };
        })
      );

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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: ["Employee", "Manager"],
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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: ["Employee", "Manager"],
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
      const {id} = req.params;
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const response = await StaffMember.findOne({staff_Id: parseInt(id)})
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
      const {id} = req.params;
      const user = await User.findById(req.user);

      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({error: "Unauthorized User. Please sign up."});
      }

      const checkCompany = await Company.findOne({UserId: user.user_id})
        .lean()
        .exec();

      if (!checkCompany) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({error: "Bad Request"});
      }

      // Fetch staff member
      const response = await StaffMember.findOne({staff_Id: parseInt(id)});

      if (!response) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({error: "Staff Member not found"});
      }

      // Process the single staff member instead of using map
      const employeemanagerProjectData = await Project.find({
        Project_ManagersId: {$in: [response.staff_Id]},
      });

      const getResourceId = await RoleResource.find({
        RRId: {$in: [response.staff_Id]},
      });

      const projectIds = getResourceId.flatMap(
        (resource) => resource.ProjectId || []
      );

      // Find Projects where staff is a resource
      const findEmployeeProject = await Project.find({
        ProjectId: {$in: projectIds},
      })
        .lean()
        .exec();
      // Format response
      const employeeProjectsResponse = {
        ...response.toObject(),
        ManagerProject: employeemanagerProjectData,
        Employeeproject: findEmployeeProject,
      };

      return res.status(HttpStatusCodes.OK).json({
        result: employeeProjectsResponse,
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
      const checkcompany = await Company.findOne({UserId: user.user_id})
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

  fetch_employee_Timesheet: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please sign up.");
      }

      const checkCompany = await Company.findOne({UserId: user.user_id})
        .lean()
        .exec();
      if (!checkCompany) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request. Company not found.");
      }

      let queryObj = {
        CompanyId: checkCompany.Company_Id,
        staff_Id: req.params.id,
      };

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const staffMembers = await StaffMember.find(queryObj)
        .skip(skip)
        .limit(limit);
      const totalRecords = await StaffMember.countDocuments(queryObj);

      const projectTimesheet = await Promise.all(
        staffMembers.map(async (item) => {
          const fetchProject = await Project.find({
            Project_ManagersId: item.staff_Id,
          });
          const rrids = await RoleResource.find({RRId: item.staff_Id});
          const projectIds = rrids.map((item) => item.ProjectId);

          const employeeTimesheets = await TimeSheet.find({
            project: {$in: projectIds},
          });
          const projectManagerTimesheet = await TimeSheet.find({
            project: {$in: fetchProject.map((p) => p.ProjectId)},
          });

          return {employeeTimesheets, projectManagerTimesheet};
        })
      );

      return res.status(HttpStatusCodes.OK).json({
        result: projectTimesheet,
        success: true,
        pagination: {
          totalRecords,
          currentPage: page,
          totalPages: Math.ceil(totalRecords / limit),
        },
      });
    } catch (error) {
      return res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({error: error?.message});
    }
  }),
};

module.exports = employeeCtr;
