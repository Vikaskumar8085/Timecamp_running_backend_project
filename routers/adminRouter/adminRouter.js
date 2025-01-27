const express = require("express");

const verifyToken = require("../../Auth/verifyAuth");
const adminCtr = require("../../controller/Authcontrollers/admin/adminCtr");
const clientCtr = require("../../controller/Authcontrollers/client/clientCtr");

const adminRouter = express.Router();

adminRouter.post("/create-admin", verifyToken, adminCtr.create_admin);

adminRouter.post("/create-client", verifyToken, clientCtr.create_client);

module.exports = adminRouter;
