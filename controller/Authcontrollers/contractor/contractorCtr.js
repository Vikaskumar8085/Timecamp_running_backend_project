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
const Designation = require("../../../models/MasterModels/Designation/Designation");
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

      // check in admin
      // const checkinadmin = await User.findOne({Email: req.body.Email});
      // if (checkinadmin) {
      //   res.status(HttpStatusCodes.BAD_REQUEST);
      //   throw new Error(
      //     "This email is already used. Please provide a different email address."
      //   );
      // }
      // check in client

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
      // const formattedDate = moment(req.body.Joining_Date).format("YYYY-MM-DD");
      // create contractor
      if (req.file) {
        let attachmentPath = req.file ? req.file.filename : "Photos";
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

        var contractorattachment = attachmentPath
          ? `${req.protocol}://${req.get(
              "host"
            )}/${uploadPath}/${attachmentPath}`
          : null;
      }

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
        Rate: req.body.Cost,
        Unit: req.body.Unit,
        Currency: req.body.Currency,
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
                  <h1>Your user name is ${response?.UserName}</h1>
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
          Pic: user?.Photo,
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
          ReciverId: updatedContractor?.staff_Id,
          Pic: user?.Photos,
          Name: user?.Role.concat(" ", user?.FirstName),
          Description: `Dear ${updatedContractor?.FirstName}, your account has been successfully updated!`,
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
        Role: {$in: ["Contractor"]},
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
        message: "fetch successfully Contractor",
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
        message: "fetch Contractor project successfully",
        result: findProject,
      });
      // new change
      // const newresponse = await StaffMember.aggregate([
      //   {
      //     $match: {staff_Id: Number(id)},
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

      // // newchange
      // const response = await StaffMember.findOne({staff_Id: Number(id)})
      //   .lean()
      //   .exec();
      // if (!response) {
      //   return res
      //     .status(HttpStatusCodes.NOT_FOUND)
      //     .json({error: "Staff Member not found"});
      // }

      // // Find Projects where staff is a manager
      // const contractorProjectData = await Project.find({
      //   Project_ManagersId: {$in: [response.staff_Id]},
      // })
      //   .lean()
      //   .exec();

      // // Find Resource Roles
      // const getResourceId = await RoleResource.find({
      //   RRId: {$in: [response.staff_Id]},
      // })
      //   .lean()
      //   .exec();

      // // Extract project IDs from `getResourceId`
      // const projectIds = getResourceId.flatMap(
      //   (resource) => resource.ProjectId || []
      // );

      // // Find Projects where staff is a resource
      // const findContractorProject = await Project.find({
      //   ProjectId: {$in: projectIds},
      // })
      //   .lean()
      //   .exec();

      // // Format response
      // const contractorProjectsResponse = {
      //   ...response,
      //   ManagerProject: contractorProjectData,
      //   ContractorProject: findContractorProject,
      // };

      // return res.status(HttpStatusCodes.OK).json({
      //   result: newresponse,
      //   success: true,
      // });
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

  fetch_contractor_timesheet_statcard: asynchandler(async (req, res) => {
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
        Role: "Contractor",
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

module.exports = contractorCtr;
