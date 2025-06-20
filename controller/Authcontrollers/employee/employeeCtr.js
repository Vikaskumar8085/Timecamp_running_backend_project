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
const sendEmail = require("../../../utils/SendMail/SendMail");
const Notification = require("../../../models/Othermodels/Notification/Notification");
const path = require("path");
const Client = require("../../../models/AuthModels/Client/Client");
const Designation = require("../../../models/MasterModels/Designation/Designation");

const employeeCtr = {
  // create employee
  create_employee: asyncHandler(async (req, res) => {
    try {
      // check user
      console.log(req.body, ">>>>>>>>>>>>>");
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
      // check in admin
      // const checkinadmin = await User.findOne({Email: req.body.Email});
      // if (checkinadmin) {
      //   res.status(HttpStatusCodes.BAD_REQUEST);
      //   throw new Error(
      //     "This email is already used. Please provide a different email address."
      //   );
      // }
      // check in admin

      // const checkinclient = await Client.findOne({
      //   Client_Email: req.body.Email,
      // });
      // if (checkinclient) {
      //   res.status(HttpStatusCodes.BAD_REQUEST);
      //   throw new Error(
      //     "This email is already used. Please provide a different email address."
      //   );
      // }

      const genhash = await bcrypt.genSalt(12);
      const hashpassword = await bcrypt.hash(req.body.Phone, genhash);
      if (req.file) {
        let attachmentPath = req.file ? req.file.filename : "Profile";
        let uploadPath = "uploads/";

        // Get file extension
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        // console.log(fileExt, "reqogsdfisdfl");

        // Define subfolders based on file type
        if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
          uploadPath += "documents/";
        } else if (
          [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)
        ) {
          uploadPath += "images/";
        } else if (file.mimetype === "text/csv") {
          uploadPath += "csv/";
        } else {
          uploadPath += "others/"; // Fallback folder
        }

        var employeeattachment = attachmentPath
          ? `${req.protocol}://${req.get(
              "host"
            )}/${uploadPath}/${attachmentPath}`
          : null;
      }

      // create Employee

      const response = await StaffMember({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Address: req.body.Address,
        Password: hashpassword,
        Joining_Date: moment(req.body.Joining_Date).format("DD/MM/YYYY"),
        DesignationId: req.body.DesignationId,
        Backlog_Entries: req.body.Backlog_Entries,
        Socail_Links: req.body.Socail_Links,
        Permission: req.body.Permission,
        ManagerId: req.body.ManagerId,
        Photos: employeeattachment,
        Unit: req.body.Unit,
        Currency: req.body.Currency,
        Rate: req.body.Cost,
        Role: "Employee",
        CompanyId: company.Company_Id,
        days: req.body.days,
      });

      const managerids = await response.ManagerId;
      const checkmanagerids = await StaffMember.findOne({
        staff_Id: managerids,
      });
      if (checkmanagerids) {
        await StaffMember.updateOne({staff_Id: managerids}, {Role: "Manager"});
      }
      await response.save();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad request");
      }
      const send_to = response?.Email;
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
                  <h1>Your user name is ${response?.UserName} </h1>
                  <h1>Your Password is ${response?.Phone}  </h1>

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
          Pic: user?.Photo,
          Name: user?.Role.concat(" ", user?.FirstName),
          Description: `Dear ${response?.FirstName}, your account has been successfully updated!`,
        }).save();
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

  // update employee

  update_employee: asyncHandler(async (req, res) => {
    try {
      // Check user
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Sign up.");
      }

      // Check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Check if employee exists
      const employee = await StaffMember.findOne({staff_Id: req.params.id});
      if (!employee) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Employee not found.");
      }
      if (req.file) {
        let attachmentPath = req.file ? req.file.filename : employee.Photos;
        let uploadPath = "uploads/";

        // Get file extension
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        console.log(fileExt, "reqogsdfisdfl");

        // Define subfolders based on file type
        if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
          uploadPath += "documents/";
        } else if (
          [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)
        ) {
          uploadPath += "images/";
        } else if (file.mimetype === "text/csv") {
          uploadPath += "csv/";
        } else {
          uploadPath += "others/"; // Fallback folder
        }

        // console.log(uploadPath, "upload path");

        var employeeattachment = attachmentPath
          ? `${req.protocol}://${req.get(
              "host"
            )}/${uploadPath}/${attachmentPath}`
          : null;
      }
      // Update fields
      employee.FirstName = req.body.FirstName || employee.FirstName;
      employee.LastName = req.body.LastName || employee.LastName;
      employee.Email = req.body.Email || employee.Email;
      employee.Phone = req.body.Phone || employee.Phone;
      employee.Address = req.body.Address || employee.Address;
      employee.Joining_Date = req.body.Joining_Date
        ? moment(req.body.Joining_Date).format("DD/MM/YYYY")
        : employee.Joining_Date;
      employee.DesignationId = req.body.DesignationId || employee.DesignationId;
      employee.Backlog_Entries =
        req.body.Backlog_Entries || employee.Backlog_Entries;
      employee.Socail_Links = req.body.Socail_Links || employee.Socail_Links;
      employee.Photos = employeeattachment || employee.Photos;
      employee.Permission = req.body.Permission || employee.Permission;
      employee.ManagerId = req.body.ManagerId || employee.ManagerId;

      // Update password if provided
      if (req.body.Password) {
        const genhash = await bcrypt.genSalt(12);
        employee.Password = await bcrypt.hash(req.body.Password, genhash);
      }

      // Update Manager role if needed
      if (req.body.ManagerId) {
        const manager = await StaffMember.findOne({
          staff_Id: req.body.ManagerId,
        });
        if (manager) {
          await StaffMember.updateOne(
            {staff_Id: req.body.ManagerId},
            {Role: "Manager"}
          );
        }
      }
      const findManagers = await StaffMember.find({
        ManagerId: {$in: employee.ManagerId},
      });

      if (findManagers.length > 0) {
        await StaffMember.updateMany(
          {staff_Id: {$in: findManagers.map((manager) => manager.staff_Id)}},
          {Role: "Employee"}
        );
      }

      await employee.save();

      // Send email notification
      const send_to = employee?.Email;
      const subject = "Account Update Notification";
      const message = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
              .content { font-size: 16px; line-height: 1.5; color: #333333; }
              .footer { text-align: center; padding-top: 20px; font-size: 14px; color: #666666; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="content">
                  <h1>Hello, ${employee.FirstName}</h1>
                  <p>Your account details have been updated successfully.</p>
                  <p>If you did not request these changes, please contact support immediately.</p>
                  <p>Best regards,<br>Time Camp</p>
              </div>
              <div class="footer">
                  <p>1234 Street Address, City, State, ZIP</p>
              </div>
          </div>
      </body>
      </html>`;

      const mailsend = await sendEmail(subject, message, send_to);
      if (!mailsend) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Failed to send update notification email.");
      } else {
        await Notification({
          SenderId: user?.user_id,
          ReciverId: employee.staff_Id,
          Name: user?.Role.concat(" ", user?.FirstName),
          Description: `Dear ${employee?.Client_Name}, your account has been successfully updated!`,
        }).save();
      }

      return res.status(HttpStatusCodes.OK).json({
        message: "Employee updated successfully",
        success: true,
        result: employee,
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
        Role: {$in: ["Employee", "Manager"]},
        ...searchQuery, // Merge search filters
      };

      // Fetch employees with pagination
      const staffresponse = await StaffMember.find(queryObj)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total employees for pagination
      const totalCount = await StaffMember.countDocuments(queryObj);

      // Fetch manager details in bulk
      const managerIds = staffresponse
        .map((item) => item.ManagerId)
        .filter(Boolean);
      const managers = await StaffMember.find({staff_Id: {$in: managerIds}})
        .select("staff_Id FirstName")
        .lean()
        .exec();
      const managerMap = managers.reduce((acc, mgr) => {
        acc[mgr.staff_Id] = mgr.FirstName;
        return acc;
      }, {});

      // Append manager names efficiently
      const response = staffresponse.map((item) => ({
        ...item,
        Manager: managerMap[item.ManagerId] || null,
      }));

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

  //   fetch active employee
  fetch_active_employee: asyncHandler(async (req, res) => {
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
        Role: {$in: ["Employee", "Manager"]},
        IsActive: "Active",
        ...searchQuery, // Merge search filters
      };

      // Fetch employees with pagination
      const staffresponse = await StaffMember.find(queryObj)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total employees for pagination
      const totalCount = await StaffMember.countDocuments(queryObj);

      // Fetch manager details in bulk
      const managerIds = staffresponse
        .map((item) => item.ManagerId)
        .filter(Boolean);
      const managers = await StaffMember.find({staff_Id: {$in: managerIds}})
        .select("staff_Id FirstName")
        .lean()
        .exec();
      const managerMap = managers.reduce((acc, mgr) => {
        acc[mgr.staff_Id] = mgr.FirstName;
        return acc;
      }, {});

      // Append manager names efficiently
      const response = staffresponse.map((item) => ({
        ...item,
        Manager: managerMap[item.ManagerId] || null,
      }));

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

  //   fetch inactive emplloyee
  fetch_inactive_employee: asyncHandler(async (req, res) => {
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
        Role: {$in: ["Employee", "Manager"]},
        IsActive: "InActive",
        ...searchQuery, // Merge search filters
      };

      // Fetch employees with pagination
      const staffresponse = await StaffMember.find(queryObj)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}) // Sort by newest first
        .lean()
        .exec();

      // Count total employees for pagination
      const totalCount = await StaffMember.countDocuments(queryObj);

      // Fetch manager details in bulk
      const managerIds = staffresponse
        .map((item) => item.ManagerId)
        .filter(Boolean);
      const managers = await StaffMember.find({staff_Id: {$in: managerIds}})
        .select("staff_Id FirstName")
        .lean()
        .exec();
      const managerMap = managers.reduce((acc, mgr) => {
        acc[mgr.staff_Id] = mgr.FirstName;
        return acc;
      }, {});

      // Append manager names efficiently
      const response = staffresponse.map((item) => ({
        ...item,
        Manager: managerMap[item.ManagerId] || null,
      }));

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
      let queryObj = {};

      queryObj = {
        staff_Id: parseInt(id),
        CompanyId: company?.Company_Id,
      };

      let response = await StaffMember.findOne(queryObj);

      if (response) {
        const findDesignation = await Designation.findOne({
          Designation_Id: response.DesignationId,
        });

        // Add a new property to the response object
        response = response.toObject(); // Convert Mongoose document to plain JS object (optional if needed)
        response.Designation_Name = findDesignation?.Designation_Name || null;
      }

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
      const response = await RoleResource.find({RRId: {$in: [parseInt(id)]}});

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Role Resource Not Found");
      }

      // Extract ProjectIds from response array
      const projectIds = await response
        .map((item) => item.ProjectId)
        .filter(Boolean);

      // Find projects using the extracted IDs
      const findProject = await Project.find({ProjectId: {$in: projectIds}});

      if (!findProject) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("project Not Found");
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "fetch Employee project successfully",
        result: findProject,
      });
      // fetch projects

      // const newresponse = await StaffMember.aggregate([
      //   {
      //     $match: {staff_Id: parseInt(id)},
      //   },
      //   {
      //     $lookup: {
      //       from: "roles",
      //       localField: "RId",
      //       foreignField: "RoleId",
      //       as: "roles",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$roles",
      //       preserveNullAndEmptyArrays: true,
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "roleresources",
      //       localField: "RRId",
      //       foreignField: "staff_Id",
      //       as: "defaultroleresource",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$defaultroleresource",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "projects",
      //       localField: "defaultroleresource.ProjectId",
      //       foreignField: "ProjectId",
      //       as: "defaultproject",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$defaultproject",
      //       preserveNullAndEmptyArrays: true, // Optional: set to false if you want to exclude non-matches
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       Project_Name: "$defaultproject.Project_Name",
      //       Project_Code: "$defaultproject.Project_Code",
      //       StartDate: "$defaultproject.Start_Date",
      //       EndData: "$defaultproject.End_Date",
      //       ProjectType: "$defaultproject.Project_Type",
      //     },
      //   },
      // ]);

      // fetch projects

      // Fetch staff member
      // const response = await StaffMember.findOne({staff_Id: parseInt(id)});

      // if (!response) {
      //   return res
      //     .status(HttpStatusCodes.NOT_FOUND)
      //     .json({error: "Staff Member not found"});
      // }

      // // Process the single staff member instead of using map
      // const employeemanagerProjectData = await Project.find({
      //   Project_ManagersId: {$in: [response.staff_Id]},
      // });

      // const getResourceId = await RoleResource.find({
      //   RRId: {$in: [response.staff_Id]},
      // });

      // const projectIds = getResourceId.flatMap(
      //   (resource) => resource.ProjectId || []
      // );

      // // Find Projects where staff is a resource
      // const findEmployeeProject = await Project.find({
      //   ProjectId: {$in: projectIds},
      // })
      //   .lean()
      //   .exec();
      // // Format response
      // const employeeProjectsResponse = {
      //   ...response.toObject(),
      //   ManagerProject: employeemanagerProjectData,
      //   Employeeproject: findEmployeeProject,
      // };

      // return res.status(HttpStatusCodes.OK).json({
      //   result: newresponse,
      //   success: true,
      // });
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
            // approval_status: "PENDING",
          });
          const projectManagerTimesheet = await TimeSheet.find({
            project: {$in: fetchProject.map((p) => p.ProjectId)},
            // approval_status: "PENDING",
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

  fetch_employee_timesheet_stafCard: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Sign Up.");
      }

      // Check if the company exists
      const company = await Company.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      const responsestaff = await StaffMember.findOne({
        staff_Id: parseInt(req.params.id),
        Role: ["Manager", "Employee"],
      });
      if (!responsestaff) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Contractor Not Found");
      }

      const roleresourcedata = await RoleResource.find({
        RRId: {$in: responsestaff?.staff_Id},
      });
      const projectid = await roleresourcedata.map((item) => item.ProjectId);
      const findProjects = await Project.find({
        $or: [
          {createdBy: {$in: responsestaff?.staff_Id}},
          {ProjectId: {$in: projectid}},
        ],
      });
      console.log("Found projects:", findProjects);

      const projectIds = findProjects
        .map((item) => item?.ProjectId)
        .filter(Boolean);
      console.log("Project IDs:", projectIds);

      const currentDate = new Date();

      // 1. Define date ranges
      const sixMonthsAgo = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 6,
        1
      );
      const endOfLastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      ); // end of previous month
      const startOfCurrentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfCurrentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ); // end of current month

      // 2. Get projects based on client

      // 3. Fetch timesheets for previous 6 full months
      const timesheets = await TimeSheet.find({
        project: {$in: projectIds},
        updatedAt: {$gte: sixMonthsAgo, $lte: endOfLastMonth},
      });

      console.log("6-Month Timesheets:", timesheets.length);

      // 4. Group by YYYY-MM
      const grouped = {};
      timesheets.forEach((ts) => {
        const month = new Date(ts.updatedAt).toISOString().slice(0, 7); // YYYY-MM

        if (!grouped[month]) {
          grouped[month] = {
            ok_hours: 0,
            blank_hours: 0,
            billed_hours: 0,
            hours: 0,
          };
        }

        grouped[month].ok_hours += ts.ok_hours || 0;
        grouped[month].blank_hours += ts.blank_hours || 0;
        grouped[month].billed_hours += ts.billed_hours || 0;
        grouped[month].hours += ts.hours || 0;
      });

      // 5. Format 6-month data
      const months = [];
      for (let i = 6; i >= 1; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const key = date.toISOString().slice(0, 7); // YYYY-MM

        months.push({
          month: key,
          ok_hours: grouped[key]?.ok_hours || 0,
          blank_hours: grouped[key]?.blank_hours || 0,
          billed_hours: grouped[key]?.billed_hours || 0,
          hours: grouped[key]?.hours || 0,
        });
      }

      // 6. Fetch current month data
      const currentMonthTimesheets = await TimeSheet.find({
        project: {$in: projectIds},
        updatedAt: {$gte: startOfCurrentMonth, $lte: endOfCurrentMonth},
      });

      const currentMonthStats = {
        ok_hours: 0,
        blank_hours: 0,
        billed_hours: 0,
        hours: 0,
      };

      currentMonthTimesheets.forEach((ts) => {
        currentMonthStats.ok_hours += ts.ok_hours || 0;
        currentMonthStats.blank_hours += ts.blank_hours || 0;
        currentMonthStats.billed_hours += ts.billed_hours || 0;
        currentMonthStats.hours += ts.hours || 0;
      });

      // Add current month to months array
      months.push({
        month: startOfCurrentMonth.toISOString().slice(0, 7),
        ...currentMonthStats,
      });

      // 7. Helper to generate card data
      const createCardData = (key, label) => {
        const values = months.map((m) => m[key]);
        const curr = values[values.length - 1];
        const prev = values[values.length - 2] || 0;

        const percentage =
          prev === 0 && curr === 0
            ? 0
            : prev === 0
            ? 100
            : +(((curr - prev) / prev) * 100).toFixed(1);

        const trendDown = curr < prev;

        return {
          title: label,
          value: curr,
          unit: "hrs",
          percentage: Math.abs(percentage),
          trendDown,
          chartData: values, // last 7 months (6 past + current)
        };
      };

      // 8. Final response for UI cards
      const responseData = [
        createCardData("ok_hours", "Ok Hours"),
        createCardData("blank_hours", "Blank Hours"),
        createCardData("billed_hours", "Billed Hours"),
        createCardData("hours", "Hours"),
      ];

      // 9. Send response
      return res.status(200).json({data: responseData});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = employeeCtr;
