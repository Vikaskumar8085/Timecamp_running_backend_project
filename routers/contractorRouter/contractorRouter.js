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

module.exports = contractorRouter;
