const asyncHandler = require("express-async-handler");
const Client = require("../../../models/AuthModels/Client/Client");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const bcrypt = require("bcryptjs");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const Notification = require("../../../models/Othermodels/Notification/Notification");
const sendEmail = require("../../../utils/SendMail/SendMail");

const clientCtr = {
  // create client
  create_client: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const company = await Company?.findOne({UserId: user?.user_id});
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
        await Notification({
          SenderId: user?.user_id,
          ReciverId: addItem.Client_Id,
          Name: user?.Role.concat(" ", user?.FirstName),
          Description: `Dear ${addItem.Client_Name}, your account has been successfully created. Welcome aboard!`,
        }).save();

        const send_to = addItem?.Client_Email;
        const subject = "Welcome! Your Timecamp Account Credentials";
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
                    <h1>Your user name is ${addItem?.Client_Email} </h1>
                    <h1>Your Password is ${addItem?.Client_Phone}  </h1>
  
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
          throw new Error("Email not sent");
        }
        return res
          .status(200)
          .json({success: true, message: "successfully client added"});
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  edit_client: asyncHandler(async (req, res) => {
    try {
      // Find user
      let updateData = {...req.body};

      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized user. Please sign up.");
      }
      // Check if the company exists
      const company = await Company.findOne({UserId: user.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Company not found. Please create a company first.");
      }
      // Find the client to update
      const client = await Client.findOne({
        Client_Id: parseInt(req.params.id),
      });

      if (["Active", "InActive", "Dead"].includes(client?.Client_Status)) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          `You cannot update the client because their status is ${client.Client_Status}.`
        );
      }
      if (req.body.Password) {
        const salt = await bcrypt.genSalt(12);
        updateData.Password = await bcrypt.hash(req.body.Password, salt);
      }

      if (!client) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Client not found.");
      } else {
        await Notification({
          SenderId: user?.user_id,
          ReciverId: client?.Client_Id,
          Name: user?.Role.concat(" ", user?.FirstName),
          Description: `Dear ${client.Client_Name}, your account has been updated By Admin`,
        }).save();

        await client.updateOne({$set: {...updateData}});
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Client updated successfully.",
        result: client,
      });
    } catch (error) {
      throw new Error(error?.message);
    }

    //
  }),

  remove_client: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized user. Please sign up.");
      }
      // Check if the company exists
      const company = await Company.findOne({UserId: user.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Company not found. Please create a company first.");
      }

      const response = await Client.findOne({Client_Id: req.params.id});
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("client Not Found");
      } else {
        const restrictedStatuses = ["Active", "InActive", "Dead"];
        if (restrictedStatuses.includes(response?.Client_Status)) {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error(
            `you can not remove client because client is ${response?.Client_Status}`
          );
        }
        await response.deleteOne();
        res.status(HttpStatusCodes.OK).json({
          success: true,
          message: "The client has been successfully removed.",
        });
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch clients
  fetch_client: asyncHandler(async (req, res) => {
    try {
      // Check user authentication
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please sign up.");
      }

      // Check if company exists
      const company = await Company.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error(
          "Company does not exist. Please create a company first."
        );
      }

      // Filtering and searching
      let {search, page = 1, limit = 10} = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      let queryObj = {
        Common_Id: company?.Company_Id,
        Role: "Client",
      };

      if (search) {
        queryObj.$or = [
          {Client_Name: {$regex: search, $options: "i"}}, // Case-insensitive search
          {Client_Email: {$regex: search, $options: "i"}},
        ];
      }

      // Pagination
      const totalClients = await Client.countDocuments(queryObj);
      const clients = await Client.find(queryObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      if (!clients) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }

      return res.status(HttpStatusCodes.OK).json({
        result: clients,
        totalPages: Math.ceil(totalClients / limit),
        currentPage: page,
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
      const company = await Company?.findOne({UserId: user?.user_id});
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
      const company = await Company?.findOne({UserId: user?.user_id});
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
      const company = await Company?.findOne({UserId: user?.user_id});
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
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      // response
      const response = await Client.findOne({Client_Id: req.params.id})
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
      const company = await Company?.findOne({UserId: user?.user_id});
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

      let queryObj = {
        clientId: req.params.id,
        CompanyId: company.Company_Id,
      };

      // Pagination parameters
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
      const skip = (page - 1) * limit;

      // Get paginated projects
      const response = await Project.find(queryObj).skip(skip).limit(limit);

      if (!response || response.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Projects Not Found");
      }

      // Fetch timesheet data for the projects
      const timesheetresponse = await Promise.all(
        response.map(async (item) => {
          const timesheetdata = await TimeSheet.find({
            project: item?.ProjectId,
          })
            .skip(skip)
            .limit(limit); // Apply pagination to timesheet data

          // Extract all staff IDs
          const staffIds = await timesheetdata.map((ts) => ts.Staff_Id);

          const members = await StaffMember.find({
            staff_Id: {$in: staffIds},
          });

          const MemberName = await members.map((member) => member.FirstName);

          return {timesheetdata, MemberName};
        })
      );

      // Get total count of projects (for frontend pagination)
      const totalProjects = await Project.countDocuments(queryObj);

      return res.status(HttpStatusCodes.OK).json({
        result: timesheetresponse,
        success: true,
        message: "Timesheet client",
        pagination: {
          totalPages: Math.ceil(totalProjects / limit),
          currentPage: page,
          totalItems: totalProjects,
        },
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = clientCtr;
