const asynchandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const generateToken = require("../../../Auth/generateToken");
const Client = require("../../../models/AuthModels/Client/Client");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const Token = require("../../../models/Othermodels/Token/Token");
const credentials = require("../../../credential/credential");
const axios = require("axios");
const Notification = require("../../../models/Othermodels/Notification/Notification");
const sendEmail = require("../../../utils/SendMail/SendMail");
const crypto = require("crypto");

const userCtr = {
  // register
  register: asynchandler(async (req, res) => {
    try {
      let {FirstName, LastName, Email, Password, Term} = req.body;
      if (!Password) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Please Enter Your Password");
      }
      const genhash = await bcrypt.genSalt(12);
      const hashpassword = await bcrypt.hash(Password, genhash);

      const userExists = await User.findOne({Email: req.body.Email});
      if (userExists) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Email has already been registered");
      }
      const resp = await User({
        FirstName,
        LastName,
        Email,
        Password: hashpassword,
        Term,
        IsAdmin: true,
        ...req.body,
      });

      if (resp) {
        const hashgen = crypto.randomBytes(32).toString("hex") + resp._id;
        const hash = crypto.createHash("sha256").update(hashgen).digest("hex");
        const saveToken = await Token({
          userId: resp._id,
          token: hash,
          createdAt: Date.now(),
          expireAt: Date.now() + 30 * 60 * 1000, // 30 min expire
        });

        const send_to = Email;
        const subject = "verification mail from Timecamp team";
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
                    <h1>Hello [Recipient's Name],</h1>
                    <p>We hope this email finds you well. here is your verify link  <a href="http://localhost:5173/verify/${hash}">http://localhost:5173/verify</a></p>
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
        // const message = `here is your verify link  <a href="http://localhost:5173/verify/${hash}">http://localhost:5173/verify</a>`;
        const mailsend = await sendEmail(subject, message, send_to);
        if (mailsend) {
          console.log("mail send");
          await saveToken.save();
          await resp.save();
          return res.status(HttpStatusCodes.CREATED).json({
            message: "registeration successfully ! please check your email",
            success: true,
          });
        }
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // login
  login: asynchandler(async (req, res) => {
    const {Email, Username} = req.body;
    try {
      console.log(Email, Username);
      let user = null;
      var role = null;
      let redirectUrl = null;

      if (Email) {
        user = await User.findOne({Email: req.body.Email});

        if (user) {
          role = user.Role; // No need to await

          if (!user.isVerify) {
            res.status(HttpStatusCodes.BAD_REQUEST);
            throw new Error(
              `Dear ${user.FirstName}, your email is not verified. Please verify your email at your earliest convenience. Thank you!`
            );
          }

          if (user.Role === "Admin" || user.Role === role) {
            const checkCompany = await Company.findOne({UserId: user.user_id})
              .lean()
              .exec();
            redirectUrl = checkCompany ? "/dashboard" : "/company";
          }
        }
      }

      // Admin functionality
      if (!user && Email) {
        user = await StaffMember.findOne({UserName: Email});

        if (user) {
          role = await user?.Role;
          redirectUrl = "/dashboard";
        }
      }

      // if (!user) {
      //   res.status(HttpStatusCodes.UNAUTHORIZED);
      //   throw new Error("User and Password Invalid !");
      // }

      // check in client

      // if (user.isVerify === false) {
      //   res.status(HttpStatusCodes.BAD_REQUEST);
      //   throw new Error("your email is not verified please verify your mail");
      // }

      // if (user.BlockStatus === "Block") {
      //   res.status(503);
      //   throw new Error("Please Connect with Your Admin And super Admin");
      // }

      // check if user data exists,
      // If not found, check in the Client model for Email match
      if (!user && Email) {
        user = await Client.findOne({Client_Email: Email});

        console.log(user, "??>FF"); // Debugging log

        if (user) {
          if (user.System_Access === false) {
            res.status(HttpStatusCodes.BAD_REQUEST);
            throw new Error("You do not have system access");
          }
          redirectUrl = "/dashboard";
        }
      }

      // Ensure user exists before checking password
      if (!user) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("User not found");
      }

      // User exists, check if password is correct
      const passwordIsCorrect = await bcrypt.compare(
        req.body.Password,
        user.Password
      );

      if (!passwordIsCorrect) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Invalid username or password");
      }
      const token = await generateToken({id: user._id});
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "login successfully",
        token: token,
        redirectUrl: redirectUrl,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // get user profile
  getUserProfile: asynchandler(async (req, res) => {
    try {
      let user = await User.findById(req.user);

      // If user is found and is an Admin, check for associated company
      if (user?.Role === "Admin") {
        const checkCompany = await Company.findOne({UserId: user.user_id});

        if (!checkCompany) {
          res.status(HttpStatusCodes.NOT_FOUND);
          throw new Error(
            "Company not found. Please create your company to proceed. Thank you!"
          );
        }
      }

      // const checkholiday
      // If user is not found in `User`, check `Client`
      if (!user) {
        user = await Client.findById(req.user);
      }

      // If user is still not found, check `StaffMember`
      if (!user) {
        user = await StaffMember.findById(req.user);
      }

      // If user is still null, return an error
      if (!user) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("User not found");
      }

      return res.status(HttpStatusCodes.OK).json({
        message: "",
        success: true,
        result: user,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  verifyUser: asynchandler(async (req, res) => {
    try {
      const {token} = req.params;
      if (!token) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Token Not Found"});
      }

      const checktoken = await Token.findOne({
        token: token,
        expireAt: {$gte: Date.now()},
      });
      if (!checktoken) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json("token has been exprired");
      }

      const user = await User.findById({_id: checktoken.userId});
      if (user) {
        await User.updateOne({_id: user._id}, {$set: {isVerify: true}});
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      return res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json(error.message);
    }
  }),

  edituser: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // change Password

  ChangepasswordCtr: asynchandler(async (req, res) => {
    try {
      const {oldPassword, newPassword} = req.body;
      // Validate request body
      if (!oldPassword || !newPassword) {
        res.status(HttpStatusCodes?.NOT_FOUND);
        throw new Error("All fields are required");
      }

      let user = await User.findOne(req.user);
      // Check Client Schema
      if (!user) {
        user = await Client.findOne(req.user);
      }

      // Check StaffMember Schema
      if (!user) {
        user = await StaffMember.findOne({Email});
      }

      if (!user) {
        return res
          .status(404)
          .json({success: false, message: "User does not exist"});
      }

      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.Password);
      if (!isMatch) {
        res.status(HttpStatusCodes?.NOT_FOUND);
        throw new Error("Old password is incorrects");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      user.Password = hashedPassword;
      await user.save();
      return res
        .status(200)
        .json({success: true, message: "Password changed successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  ForgetPasswordCtr: asynchandler(async (req, res) => {
    try {
      let user = null;
      let hashedToken = null;
      user = await User.findOne({Email: req.body.Email});
      // check client
      if (!user) {
        user = await Client.findOne({Client_Email: req.body.Email});
      }
      // check StaffmembersF
      if (!user) {
        user = await StaffMember.findOne({Email: req.body.Emal});
      }
      if (!user) {
        res.status(404);
        throw new Error("User does not exist");
      }
      let resetToken =
        (await crypto.randomBytes(32).toString("hex")) + user._id;
      console.log(resetToken, "reset Token this is the token");
      hashedToken = await crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      console.log(hashedToken, "hashedToken");
      let token = await Token.findOne({userId: user._id});
      if (token) {
        console.log(token, "this is the token");
        await token.deleteOne();
      }
      await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expireAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
      }).save();

      // Hash token before saving to DB

      // Save Token to DB
      // Construct Reset Url
      const resetUrl = `${credentials.FRONTEND_URL}/reset-password/${resetToken}`;
      // Construct Reset URL
      let userName = user?.Firstname || user?.Client_Name;
      // Email content
      const subject = "Password Reset Request";
      const message = `
    <h2>Hello ${userName || "User"}</h2>
    <p>Please use the link below to reset your password:</p>
    <p>This reset link is valid for only 30 minutes.</p>
    <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    <p>Regards,</p>
    <p>Ignitive Team</p>
  `;
      const send_to = user.Client_Email || user.Email; // Ensure correct email field is used
      // Send Email
      const emailSent = await sendEmail(subject, message, send_to);
      if (!emailSent) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        throw new Error("Email sending Failed");
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "Please check your Email "});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // ResetPasswordCtr: asynchandler(async (req, res) => {
  //   try {
  //     const {password} = req.body;
  //     const {resetToken} = req.params;
  //     const hashedToken = crypto
  //       .createHash("sha256")
  //       .update(resetToken)
  //       .digest("hex");

  //     // fIND tOKEN in DB
  //     const userToken = await Token.findOne({
  //       token: hashedToken,
  //       expiresAt: {$gt: Date.now()},
  //     });
  //     if (!userToken) {
  //       res.status(404);
  //       throw new Error("Invalid or Expired Token");
  //     }
  //     const user = null;
  //     if (!user) {
  //       user = await User.findOne({_id: userToken.userId});
  //     }
  //     if (!user) {
  //       user = await Client?.findOne({_id: userToken.userId});
  //     }
  //     if (!user) {
  //       user = await StaffMember.findOne({_id: userToken.userId});
  //     }
  //     user.Password = password;
  //     await user.save();
  //     res.status(HttpStatusCodes.OK).json({
  //       message: "Password Reset Successful, Please Login",
  //     });
  //   } catch (error) {
  //     throw new Error(error?.message);
  //   }
  // }),

  ResetPasswordCtr: asynchandler(async (req, res) => {
    try {
      const {password} = req.body;
      const {resetToken} = req.params;

      if (!password) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({message: "Password is required"});
      }

      // Hash the token for comparison
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Find the token in DB
      const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()},
      });
      if (!userToken) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Invalid or expired token"});
      }

      // Find the user across multiple schemas
      let user =
        (await User.findById(userToken.userId)) ||
        (await Client.findById(userToken.userId)) ||
        (await StaffMember.findById(userToken.userId));
      if (!user) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "User not found"});
      }
      // Hash the new password before saving
      const salt = await bcrypt.genSalt(10);
      user.Password = await bcrypt.hash(password, salt);

      await user.save();
      // Remove the token after successful reset
      await userToken.deleteOne();
      return res.status(HttpStatusCodes.OK).json({
        message: "Password reset successful, please login",
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          error.message || "An error occurred while resetting the password",
      });
    }
  }),
  Googleauth: asynchandler(async (req, res) => {
    try {
      // console.log(req.body.access_token, "access_token");

      if (req.body.access_token) {
        const response = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${req.body.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${req.body.access_token}`,
            },
          }
        );

        if (response) {
          const checkUser = await User.findOne({Email: response.data?.email});
          if (!checkUser) {
            await User({
              FirstName: response?.data?.given_name,
              LastName: response?.data?.family_name,
              Email: response?.data?.email,
              isVerify: response?.data?.verified_email,
              Photo: response?.data?.picture,
              Role: "Admin",
              user_id: response?.data?.id,
              IsAdmin: true,
              Term: true,
            }).save();
          }
        }

        const user = await User.findOne({Email: response.data?.email});
        let redirectUrl = null;

        const checkCompany = await Company.findOne({UserId: user?.user_id});

        if (!checkCompany) {
          redirectUrl = "/company";
        } else {
          redirectUrl = "/dashboard";
        }
        const TOKEN = await generateToken({id: user._id});
        return res
          .status(HttpStatusCodes.OK)
          .json({success: true, result: TOKEN, redirectUrl});
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }),

  restrictionAdmin: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Un authorized user Please Signup");
      }

      const responsne = await User.findById({user_id: req.params.id});
      if (responsne) {
        await responsne.updateOne({BlockStatus: "Block"});
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchusernotification: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }
      const response = await Notification.find({
        ReciverId: user?.staff_Id,
        IsRead: false,
      }).sort({createdAt: -1});
      if (!response) {
        res.status(HttpStatusCodes?.NOT_FOUND);
        throw new Error("Client Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchadminnotification: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please Singup");
      }
      const response = await Notification.find({
        ReciverId: user?.staff_Id,
      }).sort({createdAt: -1});
      if (!response) {
        res.status(HttpStatusCodes?.NOT_FOUND);
        throw new Error("Client Not Found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = userCtr;
