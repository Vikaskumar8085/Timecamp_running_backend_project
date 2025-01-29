const express = require("express");

const verifyToken = require("../../Auth/verifyAuth");
const adminCtr = require("../../controller/Authcontrollers/admin/adminCtr");
const clientCtr = require("../../controller/Authcontrollers/client/clientCtr");
const projectCtr = require("../../controller/Project/projectCtr");
const employeeCtr = require("../../controller/Authcontrollers/employee/employeeCtr");
const contractorCtr = require("../../controller/Authcontrollers/contractor/contractorCtr");

const adminRouter = express.Router();
// admin create
adminRouter.post("/create-admin", verifyToken, adminCtr.create_admin);
adminRouter.get("/fetch-admin");

// client
adminRouter.post("/create-client", verifyToken, clientCtr.create_client);

// create project

adminRouter.post("/create-projects", verifyToken, projectCtr.create_Project);

// employee
adminRouter.post("/create-employee", verifyToken, employeeCtr.create_employee);
adminRouter.get("/fetch-employee",verifyToken,employeeCtr.fetch_employee);
adminRouter.get("/fetch-active-employee",verifyToken,employeeCtr.fetch_active_employee);
adminRouter.get("/fetch-inactive-employee",verifyToken,employeeCtr.fetch_inactive_employee);

// contractor
adminRouter.post("/create-contractor",verifyToken,contractorCtr.create_contractor);
adminRouter.get("/fetch-contractor",verifyToken,contractorCtr.fetch_all_contractor);
adminRouter.get("/fetch-active-contractor",verifyToken,contractorCtr.fetch_active_contractor);
adminRouter.get("/fetch-inactive-contractor",verifyToken,contractorCtr.fetch_inactive_contractor);

module.exports = adminRouter;
