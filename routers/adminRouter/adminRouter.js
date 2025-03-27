const express = require("express");

const verifyToken = require("../../Auth/verifyAuth");
const adminCtr = require("../../controller/Authcontrollers/admin/adminCtr");
const clientCtr = require("../../controller/Authcontrollers/client/clientCtr");
const projectCtr = require("../../controller/Project/projectCtr");
const employeeCtr = require("../../controller/Authcontrollers/employee/employeeCtr");
const contractorCtr = require("../../controller/Authcontrollers/contractor/contractorCtr");
const TaskCtr = require("../../controller/Task/TaskCtr");
const TimesheetCtr = require("../../controller/TimesheetCtr/TimesheetCtr");
const upload = require("../../utils/FileUpload/fileUpload");

const adminRouter = express.Router();
// admin create
adminRouter.post("/create-admin", verifyToken, adminCtr.create_admin);
adminRouter.get("/fetch-admin", verifyToken, adminCtr.getalladmin);
adminRouter.get("/fetch-staffmembers", verifyToken, employeeCtr.fetch_staff);

// client
adminRouter.post("/create-client", verifyToken, clientCtr.create_client);
adminRouter.get("/fetch-client", verifyToken, clientCtr.fetch_client);
adminRouter.put("/edit-client/:id", verifyToken, clientCtr.edit_client);
adminRouter.delete("/remove-client/:id", verifyToken, clientCtr?.remove_client);
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

adminRouter.get(
  "/fetch-client-timesheet/:id",
  verifyToken,
  clientCtr.fetch_client_Timesheets
);
// create project

adminRouter.post("/create-projects", verifyToken, projectCtr.create_Project);
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
adminRouter.get(
  "/fetch-staff-members",
  verifyToken,
  projectCtr.fetchstaffmembers
);

adminRouter.get(
  "/fetch-single-project/:id",
  verifyToken,
  projectCtr.fetchsingleprojects
);

adminRouter.get(
  "/fetch-project-timesheet/:id",
  projectCtr.fetchProjectTimesheet
);

adminRouter.get(
  "/fetch-project-staff-chart/:id",
  projectCtr.fetchprojectinfochart
);
// project

// employee
adminRouter.post(
  "/create-employee",
  upload.single("Profile"),
  verifyToken,
  employeeCtr.create_employee
);
adminRouter.put(
  "/edit-employee/:id",
  verifyToken,
  upload.single("Profile"),
  employeeCtr.update_employee
);
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
adminRouter.get(
  "/fetch-employee-project/:id",
  verifyToken,
  employeeCtr.fetch_employee_projects
);

adminRouter.get(
  "/fetch-employee-timesheet/:id",
  verifyToken,
  employeeCtr.fetch_employee_Timesheet
);

// contractor
adminRouter.post(
  "/create-contractor",
  upload.single("Profile"),
  verifyToken,
  contractorCtr.create_contractor
);

adminRouter.put(
  "/edit-contractor/:id",
  verifyToken,
  contractorCtr?.update_contractor
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
adminRouter.get(
  "/fetch-contractor-project/:id",
  verifyToken,
  contractorCtr.fetch_contractor_projects
);

adminRouter.get(
  "/fetch-contractor-timesheet/:id",
  verifyToken,
  contractorCtr.fetch_contractor_Timesheet
);
// task
upload.single("file"),
  adminRouter.post(
    "/add-task",
    upload.single("file"),
    verifyToken,
    TaskCtr.addTask
  );
adminRouter.get(
  "/fetch-project-task/:id",
  verifyToken,
  TaskCtr.fetchprojectask
);
adminRouter.post(
  "/create-task/:id",
  verifyToken,
  upload.single("file"),
  TaskCtr?.create_task
);
adminRouter.get("/view-task/:id", verifyToken, TaskCtr.fetchTaskInfo);
adminRouter.get("/fetch-tasks", verifyToken, TaskCtr.fetchTasks);
adminRouter.get(
  "/fetch-projectwithmilestone",
  verifyToken,
  TaskCtr.fetchProjectwithmilestones
);
// timesheet

adminRouter.get("/fetch-timesheet", verifyToken, TimesheetCtr.fetch_timesheet);
adminRouter.get(
  "/fetch-project-time",
  verifyToken,
  TimesheetCtr.fetch_project_time
);

adminRouter.post(
  "/approvetimesheet",
  verifyToken,
  adminCtr.approvedbyadmintimesheet
);

adminRouter.put(
  "/approve-timesheet-by-admin/:id",
  verifyToken,
  adminCtr.approvedbyadmintimesheet
);
adminRouter.put(
  "/disapprove-timesheet-by-admin/:id",
  verifyToken,
  adminCtr.disapprovedbyadminTimesheet
);
adminRouter.put(
  "/billed-tiemsheet-by-admin/:id",
  verifyToken,
  adminCtr.billedByadminTimesheet
);
module.exports = adminRouter;
