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
adminRouter.get("/fetch-admin", verifyToken, adminCtr.getalladmin);

// client
adminRouter.post("/create-client", verifyToken, clientCtr.create_client);
adminRouter.get("/fetch-client", verifyToken, clientCtr.fetch_client);
adminRouter.get(
  "/fetch-active-client",
  verifyToken,
  clientCtr.fetch_active_client
);
adminRouter.get(
  "/fetch-inactive-client",
  verifyToken,
  clientCtr.fetch_inactive_client
);
adminRouter.get("/fetch-dead-client", verifyToken, clientCtr.fetch_dead_client);
adminRouter.get(
  "/fetch-single-client/:id",
  verifyToken,
  clientCtr.fetch_single_client
);
adminRouter.get(
  "/fetch-client-projects/:id",
  verifyToken,
  clientCtr.fetch_client_projects
);
// create project

adminRouter.post("/create-projects", verifyToken, projectCtr.addProject);
adminRouter.get("/fetch-projects", verifyToken, projectCtr.fetch_projects);
adminRouter.get(
  "/fetch-inactive-projects",
  verifyToken,
  projectCtr.fetch_inactive_projects
);
adminRouter.get(
  "/fetch-active-projects",
  verifyToken,
  projectCtr.fetch_active_projects
);

// employee
adminRouter.post("/create-employee", verifyToken, employeeCtr.create_employee);
adminRouter.get("/fetch-employee", verifyToken, employeeCtr.fetch_employee);
adminRouter.get(
  "/fetch-active-employee",
  verifyToken,
  employeeCtr.fetch_active_employee
);
adminRouter.get(
  "/fetch-inactive-employee",
  verifyToken,
  employeeCtr.fetch_inactive_employee
);

adminRouter.get(
  "/fetch-single-employee/:id",
  verifyToken,
  employeeCtr.fetch_single_employee
);

// contractor
adminRouter.post(
  "/create-contractor",
  verifyToken,
  contractorCtr.create_contractor
);
adminRouter.get(
  "/fetch-contractor",
  verifyToken,
  contractorCtr.fetch_all_contractor
);
adminRouter.get(
  "/fetch-active-contractor",
  verifyToken,
  contractorCtr.fetch_active_contractor
);
adminRouter.get(
  "/fetch-inactive-contractor",
  verifyToken,
  contractorCtr.fetch_inactive_contractor
);

adminRouter.get(
  "/fetch-single-contractor/:id",
  verifyToken,
  contractorCtr.fetch_single_contractor
);

module.exports = adminRouter;
