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
const path = require("path");
// function
async function generateUniqueClientName(baseName) {
  const username = baseName.toLowerCase().replace(/\s+/g, "_");

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(Math.random() * 10000);
    const uniqueUsername = `${username}_${suffix}`;
    const exists = await Client.findOne({Username: uniqueUsername});

    if (!exists) {
      return uniqueUsername;
    }
  }

  throw new Error(
    "Failed to generate a unique username after several attempts."
  );
}

// function

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

      // check in user
      // const checkinadmin = await User.findOne({Email:Client_Email});
      // if (checkinadmin) {
      //   res.status(HttpStatusCodes.BAD_REQUEST);
      //   throw new Error(
      //     "This email is already used. Please provide a different email address."
      //   );
      // }
      // check
      // check in staff
      // const checkinstaff = await StaffMember.findOne({Email: Client_Email});
      // if (checkinstaff) {
      //   res.status(HttpStatusCodes.BAD_REQUEST);
      //   throw new Error(
      //     "This email is already used. Please provide a different email address."
      //   );
      // }
      // check in staff

      // req.body.Password = req.body.Client_Phone;

      console.log(req.body, "this is the client password");

      const genhash = await bcrypt.genSalt(12);
      const hashpassword = await bcrypt.hash(req.body.Password, genhash);

      let attachmentPath = req.file ? req.file.filename : "";
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

      const clientPhoto = attachmentPath
        ? `${req.protocol}://${req.get("host")}/${uploadPath}/${attachmentPath}`
        : null;

      if (!clientPhoto) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      console.log(req.body.Password, hashpassword);

      const addItem = await Client({
        Company_Name: req.body.Company_Name,
        Client_Name: req.body.Client_Name,
        Client_Email: req.body.Client_Email,
        Client_Phone: req.body.Client_Phone,
        Client_Postal_Code: req.body.Client_Postal_Code,
        Client_Address: req.body.Client_Address,
        Client_Photo: clientPhoto,
        Password: hashpassword,
        GstNumber: req.body.GstNumber,
        System_Access: req.body.System_Access,
        Username: await generateUniqueClientName(
          req.body.Client_Name || "client"
        ),
        Common_Id: company?.Company_Id,
        ...req.body,
      });

      if (addItem) {
        await addItem.save();

        const send_to = addItem?.Client_Email;
        const subject = `Welcome! Your ${company?.Company_Name} Account Credentials`;
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
        } else {
          await Notification({
            SenderId: user?.user_id,
            ReciverId: addItem.Client_Id,
            Name: user?.Role.concat(" ", user?.FirstName),
            Pic: user?.Photo,
            Description: `Dear ${addItem.Client_Name}, your account has been successfully created. Welcome aboard!`,
          }).save();
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

      // if (["Active", "InActive", "Dead"].includes(client?.Client_Status)) {
      //   res.status(HttpStatusCodes.BAD_REQUEST);
      //   throw new Error(
      //     `You cannot update the client because their status is ${client.Client_Status}.`
      //   );
      // }
      // if (req.body.Password) {
      //   const salt = await bcrypt.genSalt(12);
      //   updateData.Password = await bcrypt.hash(req.body.Password, salt);
      // }

      updateData.Password = await client.Password;
      // upload edit pic of client
      if (req.file) {
        let attachmentPath = req.file ? req.file.filename : "Photos";

        let uploadPath = "uploads/";

        // Get file extension
        const fileExt = path
          .extname(req.file.originalname || null)
          .toLowerCase();
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

        const clientPhoto = attachmentPath
          ? `${req.protocol}://${req.get(
              "host"
            )}/${uploadPath}/${attachmentPath}`
          : null;

        updateData.Client_Photo = clientPhoto;
      }
      if (!client) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Client not found.");
      } else {
        await Notification({
          SenderId: user?.user_id,
          ReciverId: client?.Client_Id,
          Pic: user?.Photo,
          Name: user?.Role.concat(" ", user?.FirstName),
          Description: `Dear ${client.Client_Name}, your account has been updated By Admin`,
        }).save();

        await client.updateOne(
          {$set: {...updateData}},
          {runValidators: true, new: true}
        );
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

      // Extract and validate pagination & search parameters
      let {search = "", page = 1, limit = 10} = req.query;
      page = Math.max(parseInt(page, 10) || 1, 1);
      limit = Math.max(parseInt(limit, 10) || 10, 1);

      let queryObj = {
        Common_Id: company?.Company_Id,
        Role: "Client",
      };

      // Apply search filter
      if (search.trim()) {
        queryObj.$or = [
          {Client_Name: {$regex: search, $options: "i"}},
          {Client_Email: {$regex: search, $options: "i"}},
        ];
      }

      // Fetch total client count for pagination
      const totalClients = await Client.countDocuments(queryObj);

      // Fetch paginated client data
      const clients = await Client.find(queryObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      return res.status(HttpStatusCodes.OK).json({
        result: clients,
        totalClients,
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

      // Extract query parameters
      let {search = "", page = 1, limit = 10} = req.query;

      page = Math.max(parseInt(page, 10), 1); // Ensure page is at least 1
      limit = Math.max(parseInt(limit, 10), 1); // Ensure limit is at least 1

      // Build search query
      let queryObj = {
        Common_Id: company.Company_Id,
        Client_Status: "Active",
        Role: "Client",
      };

      if (search.trim()) {
        queryObj.$or = [
          {Client_Name: {$regex: search, $options: "i"}},
          {Client_Email: {$regex: search, $options: "i"}},
        ];
      }

      // Count total matching clients (for pagination)
      const totalClients = await Client.countDocuments(queryObj);

      // Fetch paginated clients
      const clients = await Client.find(queryObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: clients,
        totalClients,
        currentPage: page,
        totalPages: Math.ceil(totalClients / limit),
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

      let {page = 1, limit = 10, search = ""} = req.query;
      page = parseInt(page, 10) || 1;
      limit = parseInt(limit, 10) || 10;

      // Construct query object
      const queryObj = {
        Common_Id: company.Company_Id,
        Client_Status: "InActive",
        Role: "Client",
      };

      // Apply search filter for both name and email
      if (search.trim()) {
        queryObj.$or = [
          {Client_Name: {$regex: search, $options: "i"}},
          {Client_Email: {$regex: search, $options: "i"}},
        ];
      }

      // Fetch total record count
      const totalRecords = await Client.countDocuments(queryObj);

      // Fetch paginated client records
      const clients = await Client.find(queryObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: clients,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // dead client
  fetch_dead_client: asyncHandler(async (req, res) => {
    try {
      // Check user
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please sign up.");
      }

      // Check company
      const company = await Company.findOne({UserId: user.user_id});
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
            {Client_Name: {$regex: req.query.search, $options: "i"}},
            {Client_Email: {$regex: req.query.search, $options: "i"}},
          ],
        };
      }

      // Query object
      const queryObj = {
        Common_Id: company.Company_Id,
        Client_Status: "Dead",
        Role: "Client",
        ...searchQuery,
      };

      // Fetch clients with pagination
      const clients = await Client.find(queryObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      const total = await Client.countDocuments(queryObj);

      return res.status(HttpStatusCodes.OK).json({
        result: clients,
        success: true,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
          limit,
        },
      });
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      throw new Error(error.message);
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

      const response = await Project.aggregate([
        {$match: queryObj},
        {
          $lookup: {
            from: "timesheets",
            localField: "project", // Assuming 'project' field in Project collection matches 'ProjectId' in timesheets
            foreignField: "ProjectId",
            as: "defaultTimesheetsdata",
          },
        },
        {
          $unwind: {
            path: "$defaultTimesheetsdata",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "staffmembers",
            let: {staffId: "$defaultTimesheetsdata.staffIds"},
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$staff_Id", "$$staffId"],
                  },
                },
              },
            ],
            as: "defaultStaffmemebers",
          },
        },
        {
          $unwind: {
            path: "$defaultStaffmemebers",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

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
        result: response,
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
