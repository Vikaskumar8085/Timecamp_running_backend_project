const asynchandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const generateToken = require("../../../Auth/generateToken");
const Client = require("../../../models/AuthModels/Client/Client");
const Company = require("../../../models/Othermodels/Companymodels/Company");

const userCtr = {
  // register
  register: asynchandler(async (req, res) => {
    try {
      const { FirstName, LastName, Email, Password, Term } = req.body;
      const genhash = await bcrypt.genSalt(12);
      const hashpassword = await bcrypt.hash(Password, genhash);
      const userExists = await User.findOne({ Email: req.body.Email });
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
    const { Email, Username, Password } = req.body;
    try {
      let user = null;
      var role = null;
      let redirectUrl = null;
      // First check for the user in the Admin (User) model
      // admin Role check by user

      if (Email) {
        user = await User.findOne({ Email: req.body.Email });
        role = await user?.Role;
      } else if (Username) {
        user = await User.findOne({ FirstName: Username });
        role = await user?.Role;
      }

      if (user?.Role === role || user?.Role === "Admin") {
        const checkCompany = await Company.findOne({ UserId: user?.user_id })
          .lean()
          .exec();

        if (!checkCompany) {
          redirectUrl = "/company";
        } else {
          redirectUrl = "/dashboard";
        }
      }

      // admin functionality

      // If not found, check in the Client model for Email match
      if (!user && Email) {
        user = await Client.findOne({ Client_Email: Email });
        role = await user?.Role;
        redirectUrl = "/dashboard";
      }

      // If not found, check the Employee model for phone match
      // if (!user && phone) {
      //   user = await Employee.findOne({Phone: phone});
      // }

      // user = await User.findOne({
      //   Email: req.body.Email,
      // }).select("+Password");

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

      // User exists, check if password is correct
      const passwordIsCorrect = await bcrypt.compare(
        req.body.Password,
        user.Password
      );

      if (!passwordIsCorrect) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("User and Password Invalid");
      }

      const token = await generateToken({ id: user._id });
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "login successfully",
        data: token,
        redirectUrl: redirectUrl,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = userCtr;
