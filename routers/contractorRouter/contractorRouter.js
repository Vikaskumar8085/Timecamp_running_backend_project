const express = require("express");
const ContractorCtr = require("../../controller/ContracotrController/ControllerCtr");
const verifyToken = require("../../Auth/verifyAuth");

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


module.exports = contractorRouter;
