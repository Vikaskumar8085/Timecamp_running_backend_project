const express = require("express");
const DepartmentCtr = require("../../controller/masterControllers/Department/DepartmentCtr");
const DesignationCtr = require("../../controller/masterControllers/Designation/DesignationCtr");
const RolesCtr = require("../../controller/masterControllers/Roles/RolesCtr");
const verifyToken = require("../../Auth/verifyAuth");

const masterRouter = express.Router();
// department master
masterRouter.use(verifyToken);
masterRouter.post("/create-department", DepartmentCtr.create_department);
masterRouter.get("/fetch-department", DepartmentCtr.fetch_department);
// designation master
masterRouter.post("/create-designation", DesignationCtr.create_designation);
masterRouter.get("/fetch-designation", DesignationCtr.fetch_designation);
// roles master
masterRouter.post("/create-roles", RolesCtr.create_roles);
masterRouter.get("/fetch-roles", RolesCtr.fetch_roles);

module.exports = masterRouter;
