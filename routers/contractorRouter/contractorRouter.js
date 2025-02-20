const express = require("express");
const ContractorCtr = require("../../controller/ContracotrController/ControllerCtr");
const verifyToken = require("../../Auth/verifyAuth");
const upload = require("../../utils/FileUpload/fileUpload");

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
module.exports = contractorRouter;
