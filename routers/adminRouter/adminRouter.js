const express = require("express");

const verifyToken = require("../../Auth/verifyAuth");
const adminCtr = require("../../controller/Authcontrollers/admin/adminCtr");
const clientCtr = require("../../controller/Authcontrollers/client/clientCtr");
const projectCtr = require("../../controller/Project/projectCtr");

const adminRouter = express.Router();
// admin create
adminRouter.post("/create-admin", verifyToken, adminCtr.create_admin);
adminRouter.get("/fetch-admin");

// client
adminRouter.post("/create-client", verifyToken, clientCtr.create_client);

// create project

adminRouter.post("/create-projects", verifyToken, projectCtr.create_Project);

module.exports = adminRouter;
