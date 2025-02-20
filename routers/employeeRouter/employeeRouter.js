const express = require("express");
const EmployeeCtr = require("../../controller/EmployeeController/EmployeeCtr");
const verifyToken = require("../../Auth/verifyAuth");

const employeeRouter = express.Router();
employeeRouter.use(verifyToken);

employeeRouter.get("/employee-project", EmployeeCtr.fetchemployeeprojects);
employeeRouter.get(
  "/employee-active-project",
  EmployeeCtr.fetchemployeeActiveProjects
);
employeeRouter.get(
  "/employee-inactive-project",
  EmployeeCtr.fetchemployeeInactiveProjects
);

// employee single project

employeeRouter.get("/fetch-employee-project-timesheet/:id",EmployeeCtr.getemployeesingleporjectTimesheet)

module.exports = employeeRouter;
