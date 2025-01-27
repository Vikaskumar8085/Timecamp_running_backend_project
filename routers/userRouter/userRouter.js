const express = require("express");
const userCtr = require("../../controller/Authcontrollers/user/userCtr");
const companyCtr = require("../../controller/company/CompanyCtr");
const verifyToken = require("../../Auth/verifyAuth");
const userRouter = express.Router();

// company creation
userRouter.post("/create-company", verifyToken, companyCtr.create_company);
userRouter.get("/fetch-company", verifyToken, companyCtr.fetch_company);
// company creation

// user registeration
userRouter.post("/user_register", userCtr.register);
userRouter.post("/login", userCtr.login);
module.exports = userRouter;
