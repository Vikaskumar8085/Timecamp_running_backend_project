const asynchandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const bcrypt = require("bcryptjs");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const moment = require("moment");
const RoleResource = require("../../../models/Othermodels/Projectmodels/RoleResources");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");

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
      const company = await Company?.findOne({UserId: user?.user_id});
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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: ["Contractor", "Manager"],
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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: ["Contractor", "Manager"],
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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};

      queryObj = {
        CompanyId: company?.Company_Id,
        Role: ["Contractor", "Manager"],
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
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetch_contractor_projects: asynchandler(async (req, res) => {
    try {
      const {id} = req.params;
      const user = await User.findById(req.user).lean().exec();

      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({error: "Unauthorized User. Please Signup."});
      }

      const checkCompany = await Company.findOne({UserId: user.user_id})
        .lean()
        .exec();
      if (!checkCompany) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({error: "Bad Request"});
      }

      const response = await StaffMember.findOne({staff_Id: Number(id)})
        .lean()
        .exec();
      if (!response) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({error: "Staff Member not found"});
      }

      // Find Projects where staff is a manager
      const contractorProjectData = await Project.find({
        Project_ManagersId: {$in: [response.staff_Id]},
      })
        .lean()
        .exec();

      // Find Resource Roles
      const getResourceId = await RoleResource.find({
        RRId: {$in: [response.staff_Id]},
      })
        .lean()
        .exec();

      // Extract project IDs from `getResourceId`
      const projectIds = getResourceId.flatMap(
        (resource) => resource.ProjectId || []
      );

      // Find Projects where staff is a resource
      const findContractorProject = await Project.find({
        ProjectId: {$in: projectIds},
      })
        .lean()
        .exec();

      // Format response
      const contractorProjectsResponse = {
        ...response,
        ManagerProject: contractorProjectData,
        ContractorProject: findContractorProject,
      };

      return res.status(HttpStatusCodes.OK).json({
        result: contractorProjectsResponse,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetch_contractor_Timesheet: asynchandler(async (req, res) => {
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
      console.log(staffMembers, "staffMembers");

      const projectTimesheet = await Promise.all(
        staffMembers.map(async (item) => {
          const fetchProject = await Project.find({
            Project_ManagersId: item.staff_Id,
          });
          const rrids = await RoleResource.find({RRId: item.staff_Id});
          const projectIds = rrids.map((item) => item.ProjectId);

          const employeeTimesheets = await TimeSheet.find({
            project: {$in: projectIds},
            approval_status: "PENDING",
          });
          const projectManagerTimesheet = await TimeSheet.find({
            project: {$in: fetchProject.map((p) => p.ProjectId)},
            approval_status: "PENDING",
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

module.exports = contractorCtr;
