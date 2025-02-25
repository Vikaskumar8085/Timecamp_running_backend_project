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

const userCtr = {
  // register
  register: asynchandler(async (req, res) => {
    try {
      const {FirstName, LastName, Email, Password, Term} = req.body;
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
      });

      if (resp) {
        await resp.save();
      }

      return res.status(HttpStatusCodes.CREATED).json({
        message: "registeration successfully",
        success: true,
        result: resp,
      });
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

      // First check for the user in the Admin (User) model
      // admin Role check by user

      if (Email) {
        user = await User.findOne({Email: req.body.Email});
        role = await user?.Role;
      } else if (Username) {
        user = await User.findOne({FirstName: Username});
        role = await user?.Role;
      }

      if (user?.Role === role || user?.Role === "Admin") {
        const checkCompany = await Company.findOne({UserId: user?.user_id})
          .lean()
          .exec();

        if (!checkCompany) {
          redirectUrl = "/company";
        } else {
          redirectUrl = "/dashboard";
        }
      }

      // admin functionality

      if (!user && Email) {
        user = await StaffMember.findOne({UserName: Email});
        role = await user?.Role;
        redirectUrl = "/dashboard";
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
        redirectUrl = "/dashboard";
        console.log(user, "??>FF");

        if (user.System_Access === false) {
          res.status(HttpStatusCodes.BAD_REQUEST);
          throw new Error("you do not have system access");
        }
      }

      // User exists, check if password is correct
      // const passwordIsCorrect = await bcrypt?.compare(
      //   req.body.Password,
      //   user.Password
      // );

      // if (!passwordIsCorrect) {
      //   res.status(HttpStatusCodes.BAD_REQUEST);
      //   throw new Error("User and Password Invalid");
      // }

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
      let user = null;
      user = await User.findById(req.user);
      // check client
      if (!user) {
        user = await Client.findById(req.user);
      }
      // check StaffmembersF
      if (!user) {
        user = await StaffMember.findById(req.user);
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
        await User.updateOne({isVerify: true});
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
      // const {oldPassword, Password} = req.body;
      // const user = await User.findById(req.user);
      // if (!user) {
      //   res.status(StatusCodes.UNAUTHORIZED);
      //   throw new Error("User not found, please signup");
      // }
      // if (!oldPassword || !Password) {
      //   res.status(StatusCodes.BAD_REQUEST);
      //   throw new Error("Please add old and new password");
      // }
      // // check if old password matches password in DB
      // const passwordIsCorrect = await bcrypt.compare(
      //   oldPassword,
      //   user.Password
      // );
      // // Save new password
      // if (user && passwordIsCorrect) {
      //   user.Password = Password;
      //   await user.save();
      //   res.status(StatusCodes.OK).send("Password change successful");
      // }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  ForgetPasswordCtr: asynchandler(async (req, res) => {
    try {
      let user = null;
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

      let token = await Token.findOne({userId: user._id});

      if (token) {
        await token.deleteOne();
        await new Token({
          userId: user._id,
          token: hashedToken,
          createdAt: Date.now(),
          expireAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
        }).save();
      }

      let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
      console.log(resetToken);

      // Hash token before saving to DB
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Save Token to DB

      // Construct Reset Url
      const resetUrl = `${credentials.FRONTEND_URL}/resetpassword/${resetToken}`;

      //   const message = `
      //   <h2>Hello ${user.FirstName}</h2>
      //   <p>Please use the url below to reset your password</p>
      //   <p>This reset link is valid for only 30minutes.</p>

      //   <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

      //   <p>Regards...</p>
      //   <p>Ignitive Team</p>
      // `;
      //   const subject = "Password Reset Request";
      //   const send_to = user.Email;

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, message: "Please check your Email "});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  ResetPasswordCtr: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
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
};

module.exports = userCtr;
