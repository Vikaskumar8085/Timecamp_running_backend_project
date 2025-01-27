const asynchandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const generateToken = require("../../../Auth/generateToken");

const userCtr = {
  // register
  register: asynchandler(async (req, res) => {
    try {
      const { FirstName, LastName, Email, Password, Term } = req.body;
      const genhash = await bcrypt.genSalt(12);
      const hashpassword = await bcrypt.hash(Password, genhash);
      const userExists = await User.findOne({ Email: req.body.Email });
      if (userExists) {
        res.status(StatusCodes.BAD_REQUEST);
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
    try {
      const user = await User.findOne({
        Email: req.body.Email,
      }).select("+Password");

      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("User and Password Invalid !");
      }
      if (user.isVerify === false) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("your email is not verified please verify your mail");
      }

      if (user.BlockStatus === "Block") {
        res.status(503);
        throw new Error("Please Connect with Your Admin And super Admin");
      }

      // check if user data exists,

      // User exists, check if password is correct
      const passwordIsCorrect = await bcrypt.compare(
        req.body.Password,
        user.Password
      );
      console.log(passwordIsCorrect);
      if (!passwordIsCorrect) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("User and Password Invalid");
      }

      const token = await generateToken({ id: user._id });
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "login successfully",
        data: token,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = userCtr;
