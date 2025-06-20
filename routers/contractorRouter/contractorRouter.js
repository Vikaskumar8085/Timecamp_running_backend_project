const express = require("express");
const ContractorCtr = require("../../controller/ContracotrController/ControllerCtr");
const verifyToken = require("../../Auth/verifyAuth");
const upload = require("../../utils/FileUpload/fileUpload");
const contractordashctr = require("../../controller/ContracotrController/Contractordashctr");

const contractorRouter = express.Router();
contractorRouter.use(verifyToken);

contractorRouter.post(
  "/create-contractor-project",
  ContractorCtr.addContractorProject
);

//contractor project
contractorRouter.get(
  "/contractor-project",
  ContractorCtr.fetchcontractorprojects
);
contractorRouter.get(
  "/contractor-active-project",
  ContractorCtr.fetchContractorActiveProjects
);
contractorRouter.get(
  "/contractor-inactive-project",
  ContractorCtr.fetchContractorInactiveProjects
);

//contractor project
// contractor project with id
contractorRouter.get(
  "/contract-project-timesheet/:id",
  ContractorCtr.fetchContractorProjectTimesheet
);

contractorRouter.get(
  "/contractor-project-task/:id",
  ContractorCtr.fetchContractorProjectTask
);
contractorRouter.get(
  "/fetch-contractor-single-project/:id",
  ContractorCtr.fetchcontractorsingletprojectinformation
);
// contractor project with id

// fill contractor project Timesheet
contractorRouter.post(
  "/fill-contractor-project-timesheet",
  upload.single("file"),
  ContractorCtr.FillContractorProjectTimesheet
);
// fill contractor project Timesheet
// fetch contractor Timesheet
contractorRouter.get(
  "/fetch-contractor-timesheet",
  ContractorCtr.getcontractortimesheet
);
// fetch contractor task
contractorRouter.get(
  "/fetch-contractor-tasks",
  ContractorCtr.getcontractortasks
);
contractorRouter.get(
  "/fetch-contractor-notification",
  ContractorCtr?.fetchContractornotification
);

// contractor dashboard
contractorRouter.get(
  "/fetch-contractor-dash-counter",
  contractordashctr.fetchdashboardCounter
);

// fetch contractor dashboard  Totalhours by resources

contractorRouter.get(
  "/fetch-contractor-dash-total-hour-by-resources",
  contractordashctr.fetchcontractorTotalhoursbyResources
);
// fetch contractor dashboard total hours
contractorRouter.get(
  "/fetch-contractor-dash-total-hours-by-project",
  contractordashctr.fetchcontractorTotalhoursbyprojects
);
//fetch-contractor-dash-total-hours-by-company
contractorRouter.get(
  "/fetch-contractor-dash-total-hours-by-company",
  contractordashctr.fetchcontractorTotalHoursByCompany
);

contractorRouter.get(
  "/fetch-contractor-dash-billing-status-distribution",
  contractordashctr.fetchcontractorbillingstatusdistribution
);
contractorRouter.get(
  "/fetch-contractor-dash-project-time-utilization",
  contractordashctr.fetchcontractorprojecttimeutilization
);

contractorRouter.get(
  "/fetch-contractor-dash-daily-hours",
  contractordashctr.fetchcontractordailyhours
);
contractorRouter.get(
  "/fetch-contractor-dash-approvel-billing-status",
  contractordashctr.fetchcontractorapprovelbilledhourovertime
);

// contractorRouter
contractorRouter.get(
  "/fetch-contractor-recent-project",
  contractordashctr.fetchdashtotalproject
);
// contractorRouter
contractorRouter.get(
  "/fetch-contractor-by-hours",
  contractordashctr.fetchdashhoursbyresources
);

// contractor project time
contractorRouter.get(
  "/fetch-contractor-project-time",
  ContractorCtr.fetchcontractorproject_time
);

// contractor fill timesheet

contractorRouter.post(
  "/contractor-v1-fill-timesheet",
  upload.single("file"),
  ContractorCtr.contractorfilltimehseet
);

contractorRouter.get(
  "/fetch-contractor-timesheet/:id",
  ContractorCtr.fetchcontractortimesheet
);

contractorRouter.get(
  "/fetch-contractor-milestone/:id",
  ContractorCtr.fetchcontractormilestones
);
contractorRouter.put(
  "/update-task-progress/:id",
  ContractorCtr.addtaskprogress
);
contractorRouter.get(
  "/fetch-contractor-single-task/:id",
  ContractorCtr.fetchcontractorsingletask
);
// fetch contractor dash project

contractorRouter.get(
  "/fetch-contractor-single-project-chart/:id",
  ContractorCtr.fetchcontractorinfochart
);

contractorRouter.get(
  "/fetch-contractor-team/:id",
  ContractorCtr.fetchcontractorrecentstaff
);

contractorRouter.get(
  "/fetch-contractor-alloted-task/:id",
  ContractorCtr.fetchContractorTaskAllotted
);
contractorRouter.get(
  "/fetch-contractor-Recent-activity/:id",
  ContractorCtr.fetchContractorRecentActivities
);
contractorRouter.get(
  "/fetch-conractor-milestones/:id",
  ContractorCtr.fetchContractormilestoneprojects
);

contractorRouter.put("/send-for-approvel/:id", ContractorCtr.SendForApprovel);

contractorRouter.post(
  "/approve-timesheet-by-contractor",
  ContractorCtr.approveTimesheetbyContractor
);

contractorRouter.post(
  "/disapprove-timesheet-by-contractor",
  ContractorCtr.disapproveTimesheetbyContractor
);

contractorRouter.post(
  "/billed-timesheet-by-contractor",
  ContractorCtr.billedTimesheetbyContractor
);

contractorRouter.post(
  "/fill-contractor-timesheet",
  upload.any(),
  ContractorCtr.FillContractormultiTimesheet
);

module.exports = contractorRouter;
