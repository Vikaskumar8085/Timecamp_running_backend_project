const express = require("express");
const EmployeeCtr = require("../../controller/EmployeeController/EmployeeCtr");
const verifyToken = require("../../Auth/verifyAuth");
const upload = require("../../utils/FileUpload/fileUpload");

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
employeeRouter.get(
  "/fetch-employee-project-information/:id",
  EmployeeCtr.getemployeesingleprojectinformation
);

employeeRouter.get(
  "/fetch-employee-project-tasks/:id",
  EmployeeCtr.getemployeesingleporjectTask
);
employeeRouter.get(
  "/fetch-employee-project-timesheet/:id",
  EmployeeCtr.getemployeesingleporjectTimesheet
);
employeeRouter.get(
  "/fetch-employee-timesheet",
  EmployeeCtr.getEmployeeTimesheet
);
employeeRouter.get("/fetch-employee-tasks", EmployeeCtr.getEmployeetasks);

employeeRouter.post(
  "/fill-project-timesheet",
  upload.single("file"),
  EmployeeCtr.FillEmployeeProjectTimesheet
);

employeeRouter.delete(
  "/remove-employee-timesheet/:id",
  EmployeeCtr.removeEmployeeTimesheet
);

employeeRouter.put("/send-for-approvel/:id", EmployeeCtr.SendForApprovel);
module.exports = employeeRouter;
