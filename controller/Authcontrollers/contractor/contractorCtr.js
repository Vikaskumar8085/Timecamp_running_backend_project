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
const sendEmail = require("../../../utils/SendMail/SendMail");
const Notification = require("../../../models/Othermodels/Notification/Notification");
const path = require("path");
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

      let attachmentPath = req.file ? req.file.filename : Photos;
      let uploadPath = "uploads/";

      // Get file extension
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      // console.log(fileExt, "reqogsdfisdfl");

      // Define subfolders based on file type
      if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
        uploadPath += "documents/";
      } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)) {
        uploadPath += "images/";
      } else if (file.mimetype === "text/csv") {
        uploadPath += "csv/";
      } else {
        uploadPath += "others/"; // Fallback folder
      }

      console.log(uploadPath, "upload path");

      const contractorattachment = attachmentPath
        ? `${req.protocol}://${req.get("host")}/${uploadPath}/${attachmentPath}`
        : null;

      const response = await StaffMember({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Address: req.body.Address,
        Password: hashpassword,
        Joining_Date: moment(req.body.Joining_Date).format("DD/MMM/YYYY"),
        DesignationId: req.body.DesignationId,
        ManagerId: req.body.ManagerId,
        Permission: req.body.Permission,
        Backlog_Entries: req.body.Backlog_Entries,
        Socail_Links: req.body.Socail_Links,
        Contractor_Company: req.body.Contractor_Company,
        Hourly_Rate: req.body.Hourly_Rate,
        Supervisor: req.body.Supervisor,
        Role: "Contractor",
        Photos: contractorattachment,
        CompanyId: company.Company_Id,
      });

      await response.save();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad request");
      }

      const send_to = req.body.Email;
      const subject = "Account Credential ";
      const message = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  padding-bottom: 20px;
              }
              .header img {
                  max-width: 100px;
                  height: auto;
              }
              .content {
                  font-size: 16px;
                  line-height: 1.5;
                  color: #333333;
              }
              .footer {
                  text-align: center;
                  padding-top: 20px;
                  font-size: 14px;
                  color: #666666;
              }
              .footer a {
                  color: #0066cc;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://example.com/logo.png" alt="Company Logo">
              </div>
              <div class="content">
                  <h1>Hello Dear Sir/Mam,</h1>
                  <p>Your Account has been created succsfully </p>
                  <h1>Your user name is ${response?.Email}</h1>
                  <h1>Password is ${response?.Phone} </h1>

                  <p>Thank you for your attention!</p>
                  <p>Best regards,<br>Time Camp</p>
              </div>
              <div class="footer">
                  <p>If you no longer wish to receive these emails, you can .</p>
                  <p>1234 Street Address, City, State, ZIP</p>
              </div>
          </div>
      </body>
      </htm>`;
      const mailsend = await sendEmail(subject, message, send_to);

      if (!mailsend) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("mail not send ");
      } else {
        await Notification({
          SenderId: user?.user_id,
          ReciverId: response?.staff_Id,
          Name: user?.Role.concat(" ", user?.FirstName),
          Description: `Dear ${response?.FirstName}, your account has been successfully updated!`,
        }).save();
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

  // update contractor
  update_contractor: asynchandler(async (req, res) => {
    try {
      // Check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Sign Up");
      }

      // Check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Find contractor
      const contractor = await StaffMember?.findOne({
        staff_Id: req.params.id,
      });
      if (!contractor) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Contractor not found.");
      }

      // If password is provided, hash it
      if (req.body.Password) {
        const genhash = await bcrypt.genSalt(12);
        req.body.Password = await bcrypt.hash(req.body.Password, genhash);
      }

      // Update contractor details
      const updatedContractor = await StaffMember.findOneAndUpdate(
        {staff_Id: req.params.id},
        {$set: req.body},
        {new: true}
      );

      if (!updatedContractor) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Failed to update contractor.");
      } else {
        await Notification({
          SenderId: user?.user_id,
          ReciverId: response?.staff_Id,
          Name: user?.Role.concat(" ", user?.FirstName),
          Description: `Dear ${response?.FirstName}, your account has been successfully updated!`,
        }).save();
      }

      return res.status(HttpStatusCodes.OK).json({
        message: "Contractor updated successfully",
        success: true,
        result: updatedContractor,
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

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Search query
      let searchQuery = {};
      if (req.query.search) {
        searchQuery = {
          $or: [
            {FirstName: {$regex: req.query.search, $options: "i"}},
            {LastName: {$regex: req.query.search, $options: "i"}},
            {Email: {$regex: req.query.search, $options: "i"}},
          ],
        };
      }

      // Main query
      const queryObj = {
        CompanyId: company.Company_Id,
        Role: {$in: ["Contractor", "Manager"]},
        ...searchQuery,
      };

      // Fetch results with pagination
      const response = await StaffMember.find(queryObj)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total records (for frontend pagination)
      const totalCount = await StaffMember.countDocuments(queryObj);

      // Response
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   active contractor
  fetch_active_contractor: asynchandler(async (req, res) => {
    try {
      // Check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Signup.");
      }

      // Check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Search filter
      let searchQuery = {};
      if (req.query.search) {
        searchQuery = {
          $or: [
            {FirstName: {$regex: req.query.search, $options: "i"}},
            {LastName: {$regex: req.query.search, $options: "i"}},
            {Email: {$regex: req.query.search, $options: "i"}},
          ],
        };
      }

      // Main query
      const queryObj = {
        CompanyId: company.Company_Id,
        Role: {$in: ["Contractor", "Manager"]},
        IsActive: "Active",
        ...searchQuery, // Merge search filters
      };

      // Fetch results with pagination
      const response = await StaffMember.find(queryObj)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total records (for frontend pagination)
      const totalCount = await StaffMember.countDocuments(queryObj);

      // Response
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        success: true,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }),

  //   in active contractor
  fetch_inactive_contractor: asynchandler(async (req, res) => {
    try {
      // Check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Signup.");
      }

      // Check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Search filter
      let searchQuery = {};
      if (req.query.search) {
        searchQuery = {
          $or: [
            {FirstName: {$regex: req.query.search, $options: "i"}},
            {LastName: {$regex: req.query.search, $options: "i"}},
            {Email: {$regex: req.query.search, $options: "i"}},
          ],
        };
      }

      // Main query
      const queryObj = {
        CompanyId: company.Company_Id,
        Role: {$in: ["Contractor", "Manager"]},
        IsActive: "InActive",
        ...searchQuery, // Merge search filters
      };

      // Fetch results with pagination
      const response = await StaffMember.find(queryObj)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total records (for frontend pagination)
      const totalCount = await StaffMember.countDocuments(queryObj);

      // Response
      return res.status(HttpStatusCodes.OK).json({
        result: response,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        success: true,
      });
    } catch (error) {
      throw new Error(error.message);
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
