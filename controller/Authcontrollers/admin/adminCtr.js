const asynchandler = require("express-async-handler");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const Notification = require("../../../models/Othermodels/Notification/Notification");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");
const sendEmail = require("../../../utils/SendMail/SendMail");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const path = require("path");
const adminCtr = {
  // create admin ctr
  create_admin: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
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

        var adminphoto = attachmentPath
          ? `${req.protocol}://${req.get(
              "host"
            )}/${uploadPath}/${attachmentPath}`
          : null;
      }
      const genhash = await bcrypt.genSalt(12);
      const hashpassword = await bcrypt.hash(req.body.Password, genhash);
      req.body.Password = await hashpassword;
      req.body.Term = await true;
      const createuser = await User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Photo: adminphoto,
        ...req.body,
      });
      if (!createuser) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("User not found");
      } else {
        await createuser.save();
        await Company.updateOne(
          {Company_Id: checkcompany?.Company_Id},
          {$push: {UserId: createuser.user_id}}
        );
      }

      if (createuser.length !== 0) {
        await Notification({
          SenderId: user?.user_id,
          ReciverId: createuser?.user_id,
          Name: user?.FirstName,
          Pic: user?.Photo,
          Description: `Dear ${createuser?.FirstName}, you have been successfully added as an Admin in ${checkcompany?.Company_Name} company. Welcome aboard!`,
          IsRead: false,
        }).save();

        const send_to = user?.Email;
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
                    <h1>Hello,</h1>
                    <p>Your account has been successfully created.</p>
                    <h2>Your Username: <strong>${
                      createuser?.Email || "Not Provided"
                    }</strong></h2>
                    <h2>Your Password: <strong>${
                      req.body.Password || "Not Provided"
                    }</strong></h2>
        
                    <p>Thank you for your attention!</p>
                    <p>Best regards,<br>Time Camp</p>
                </div>
                <div class="footer">
                    <p>If you no longer wish to receive these emails, you can <a href="#">unsubscribe</a>.</p>
                    <p>1234 Street Address, City, State, ZIP</p>
                </div>
            </div>
        </body>
        </html>`;

        const mailsend = await sendEmail(subject, message, send_to);
        if (!mailsend) {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error("Email not sent");
        }
      }
      return res
        .status(HttpStatusCodes.CREATED)
        .json({success: true, message: "admin created successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch admin

  edit_admin: asynchandler(async (req, res) => {
    try {
      console.log(req.body, "req.body");
      const user = await User.findById(req.user);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

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

        var adminphoto = attachmentPath
          ? `${req.protocol}://${req.get(
              "host"
            )}/${uploadPath}/${attachmentPath}`
          : null;
      }
      const response = await User.findOne({user_id: parseInt(req.params.id)});
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("User not found");
      } else {
        const {Password, ...rest} = req.body;

        await User.updateOne(
          {user_id: parseInt(req.params.id)},
          {
            $set: {
              Photo: adminphoto,
              ...rest, // Only include fields other than password
            },
          },
          {new: true, runValidators: true}
        );
        await Notification({
          SenderId: user?.user_id,
          ReciverId: user?.user_id,
          Name: user?.FirstName,
          Pic: user?.Photo,
          Description: `Dear ${user?.FirstName}, you Profile has been updated by Admin ${user?.FirstName} in ${checkcompany?.Company_Name} company. Welcome aboard!`,
          IsRead: false,
        }).save();
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({message: "admin updated successfully", success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  getalladmin: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const getAdminuser = await Company.findOne({UserId: user?.user_id});
      if (!getAdminuser && getAdminuser.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("admin Not found");
      }
      // const result = await User.aggregate([
      //   // Stage 2: Lookup to join with the Company collection
      //   {
      //     $lookup: {
      //       from: "companies", // The collection to join with
      //       localField: "user_id", // The field from the User collection
      //       foreignField: "UserId", // The field from the Company collection
      //       as: "companyDetails", // The output array field
      //     },
      //   },

      //   // Stage 3: Optionally, unwind the array if it contains a single document
      //   {
      //     $unwind: {
      //       path: "$companyDetails",
      //       preserveNullAndEmptyArrays: false,
      //     },
      //   },
      //   {
      //     $project: {
      //       FirstName: 1,
      //       LastName: 1,
      //       Email: 1,
      //       Photo: 1,
      //       Role: 1,
      //     },
      //   },
      // ]);

      let QueryObj = {};
      QueryObj = {user_id: getAdminuser.UserId};
      const result = await User.find(QueryObj).lean().exec();

      return res.status(200).json({
        success: true,
        message: "successfully fetch adimn data",
        result: result,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  approvedbyadmintimesheet: asynchandler(async (req, res) => {
    try {
      const approveIds = req.body; // List of Timesheet_Id values
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes?.UNAUTHORIZED);
        throw new Error("Unauthorized use please login");
      }

      const checkCompany = await Company.findOne({
        UserId: user.user_id,
      }).lean();
      if (!checkCompany) {
        res.status(HttpStatusCodes?.NOT_FOUND);
        throw new Error("Company not found");
      }

      for (let item of approveIds) {
        const findTimesheet = await TimeSheet.findOne({
          Timesheet_Id: item,
        });

        if (findTimesheet.approval_status === "PENDING") {
          await findTimesheet.updateOne({
            $set: {
              approval_status: "APPROVED",
              approved_by: user.user_id,
              approved_date: moment().format("DD/MM/YYYY"),
            },
          });
        } else {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error("Timesheet alerady Approved");
        }
      }

      res
        .status(200)
        .json({success: true, message: "Timesheets approved successfully."});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  disapprovedbyadminTimesheet: asynchandler(async (req, res) => {
    try {
      const approveIds = req.body; // List of Timesheet_Id values
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes?.UNAUTHORIZED);
        throw new Error("Unauthorized use please login");
      }

      const checkCompany = await Company.findOne({
        UserId: user.user_id,
      }).lean();
      if (!checkCompany) {
        res.status(HttpStatusCodes?.NOT_FOUND);
        throw new Error("Company not found");
      }

      for (let item of approveIds) {
        const findTimesheet = await TimeSheet.findOne({
          Timesheet_Id: item,
        });

        if (findTimesheet.approval_status === "APPROVED") {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error(
            "Timesheet aleady approved you can not disapproved timesheet"
          );
        }

        if (findTimesheet.approval_status === "DISAPPROVED") {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error(
            "Timesheet aleady disapproved you can not disapproved timesheet again"
          );
        }
        if (findTimesheet.approval_status === "PENDING") {
          await findTimesheet.updateOne({
            $set: {
              approval_status: "DISAPPROVED",
              approved_by: user.user_id,
              approved_date: moment().format("DD/MM/YYYY"),
            },
          });
        } else {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error("Timesheet alerady Approved");
        }
      }

      res.status(200).json({
        success: true,
        message: "Timesheets disapproved successfully.",
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  billedByadminTimesheet: asynchandler(async (req, res) => {
    try {
      const approveIds = req.body; // List of Timesheet_Id values
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes?.UNAUTHORIZED);
        throw new Error("Unauthorized use please login");
      }

      const checkCompany = await Company.findOne({
        UserId: user.user_id,
      }).lean();
      if (!checkCompany) {
        res.status(HttpStatusCodes?.NOT_FOUND);
        throw new Error("Company not found");
      }

      // BILLLED

      for (let item of approveIds) {
        const findTimesheet = await TimeSheet.findOne({
          Timesheet_Id: item,
        });
        if (!findTimesheet) {
          res.status(HttpStatusCodes?.NOT_FOUND);
          throw new Error("Timesheet not found");
        }
        if (findTimesheet.approval_status === "APPROVED") {
          if (findTimesheet.billing_status === "NOT_BILLED") {
            await findTimesheet.updateOne({
              $set: {billing_status: "BILLED"},
            });
          } else {
            res.status(HttpStatusCodes.BAD_REQUEST);
            throw new Error("it's aleardy billed");
          }
        }
        if (findTimesheet.approval_status === "DISAPPROVED") {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error(
            "The timesheet has not been approved; therefore, it cannot be billed at this time."
          );
        }
        if (findTimesheet.approval_status === "PENDING") {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error("Timesheet is one pending mode.we can not billed it");
        }
      }
      // BILLED
      res
        .status(200)
        .json({success: true, message: "Timesheets Billed successfully."});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  updateadminprofile: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      if (req.file) {
        let attachmentPath = req.file ? req.file.filename : null;
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

        var photos = attachmentPath
          ? `${req.protocol}://${req.get(
              "host"
            )}/${uploadPath}/${attachmentPath}`
          : null;
      }

      const response = await User.findOne({user_id: parseInt(req.params.id)});
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("User not found");
      } else {
        const {Password, ...rest} = req.body;
        await User.updateOne(
          {user_id: parseInt(req.params.id)},
          {
            $set: {
              ...rest,
              Photo: photos,
            },
          },
          {new: true, runValidators: true}
        );
      }
      return res.status(HttpStatusCodes.OK).json({
        message: "Proile  updated successfully",
        success: true,
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = adminCtr;
