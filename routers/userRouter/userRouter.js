const express = require("express");
const userCtr = require("../../controller/Authcontrollers/user/userCtr");
const companyCtr = require("../../controller/company/CompanyCtr");
const verifyToken = require("../../Auth/verifyAuth");
const upload = require("../../utils/FileUpload/fileUpload");
const userRouter = express.Router();

// company creation
userRouter.post(
  "/create-company",
  upload.single("Company_Logo"),
  verifyToken,
  companyCtr.create_company
);
userRouter.get("/fetch-company", verifyToken, companyCtr.fetch_company);
userRouter.put("/update-company/:id", verifyToken, companyCtr.editcompany);

// company creation

// user registeration
userRouter.post("/user_register", userCtr.register);
userRouter.post("/login", userCtr.login);
userRouter.get("/get-user", verifyToken, userCtr.getUserProfile);
userRouter.post("/forget-password", userCtr.ForgetPasswordCtr);
userRouter.put("/reset-password/:resetToken", userCtr.ResetPasswordCtr);
userRouter.get("/verify/:token", userCtr.verifyUser);
userRouter.post("/google-auth", userCtr.Googleauth);
userRouter.get(
  "/fetch-user-notification",
  verifyToken,
  userCtr.fetchusernotification
);
userRouter.get(
  "/fetch-admin-notification",
  verifyToken,
  userCtr.fetchadminnotification
);

module.exports = userRouter;
