const express = require("express");
const EmployeeCtr = require("../../controller/EmployeeController/EmployeeCtr");
const verifyToken = require("../../Auth/verifyAuth");
const upload = require("../../utils/FileUpload/fileUpload");
const employeedashctr = require("../../controller/EmployeeController/Employeedashctr");
const employeeCtr = require("../../controller/Authcontrollers/employee/employeeCtr");

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
employeeRouter.get("/fetch-employee-staff", EmployeeCtr.fetchstaffmember);
employeeRouter.get("/fetch-employee-roles", EmployeeCtr.fetchemployeeRole);
employeeRouter.get("/fetch-employee-client", EmployeeCtr.fetchclients);
employeeRouter.get(
  "/fetch-employee-notification",
  EmployeeCtr.fetchEmployeeNotificationMessage
);

// employee dashboard
employeeRouter.get(
  "/fetch-employee-dash-counter",
  employeedashctr.fetchemployeedashboardCounter
);

// employee dashboard

employeeRouter.get(
  "/fetch-employee-total-hours-by-resources",
  employeedashctr.fetchemployeeTotalhoursbyResources
);
employeeRouter.get(
  "/fetch-employee-total-hours-by-project",
  employeedashctr.fetchemployeeTotalhoursbyprojects
);

employeeRouter.get(
  "/fetch-employee-total-hour-by-company",
  employeedashctr.fetchemployeeTotalHoursByCompany
);
employeeRouter.get(
  "/fetch-employee-billing-status-distribution",
  employeedashctr.fetchemployeebillingstatusdistribution
);
employeeRouter.get(
  "/fetch-employee-daily-hours",
  employeedashctr.fetchemployeedailyhours
);
employeeRouter.get(
  "/fetch-employee-approvel-billed-hour-over-time",
  employeedashctr.fetchemployeeapprovelbilledhourovertime
);
employeeRouter.get(
  "/fetch-employee-project-time-utilization",
  employeedashctr.fetchemployeeprojecttimeutilization
);
// employee

employeeRouter.get(
  "/fetch-employee-recent-project",
  employeedashctr.fetchemployeeRecentProject
);
employeeRouter.get(
  "/fetch-employee-project-time",
  EmployeeCtr.fetchemployeeproject_time
);

// update task progress

employeeRouter.get(
  "/fetch-employee-milestone/:id",
  EmployeeCtr.fetchemployeemilestones
);
employeeRouter.put("/update-task-progress/:id", EmployeeCtr.addtaskprogress);
employeeRouter.get(
  "/fetch-employee-single-task/:id",
  EmployeeCtr.fetchEmployeesingletask
);

// fetch employee single project info chart
employeeRouter.get(
  "/fetch-employee-single-project-info-chart/:id",
  EmployeeCtr.fetchemployeeprojectchartinfo
);
module.exports = employeeRouter;
