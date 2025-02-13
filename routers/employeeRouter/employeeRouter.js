const express = require("express");
const EmployeeCtr = require("../../controller/EmployeeController/EmployeeCtr");

const employeeRouter = express.Router();

employeeRouter.get("/employee-project", EmployeeCtr.fetchemployeeprojects);
employeeRouter.get(
  "/employee-active-project",
  EmployeeCtr.fetchemployeeActiveProjects
);
employeeRouter.get(
  "/employee-inactive-project",
  EmployeeCtr.fetchemployeeInactiveProjects
);

module.exports = employeeRouter;
