const express = require("express");
const ContractorCtr = require("../../controller/ContracotrController/ControllerCtr");
const verifyToken = require("../../Auth/verifyAuth");
const upload = require("../../utils/FileUpload/fileUpload");
const contractordashctr = require("../../controller/ContracotrController/Contractordashctr");

const contractorRouter = express.Router();
contractorRouter.use(verifyToken);
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

contractorRouter.post(
  "/fill-contractor-project-timesheet",
  upload.single("file"),
  ContractorCtr.FillContractorProjectTimesheet
);

contractorRouter.get(
  "/fetch-contractor-timesheet",
  ContractorCtr.getcontractortimesheet
);
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
module.exports = contractorRouter;
