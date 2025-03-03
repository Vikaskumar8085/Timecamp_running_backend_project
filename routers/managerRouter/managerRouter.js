const express = require("express");
const managerCtr = require("../../controller/ManagerCtr/ManagerController");
const verifyToken = require("../../Auth/verifyAuth");

const managerRouter = express.Router();
managerRouter.use(verifyToken);
managerRouter.get("/fetch-manager-team", managerCtr.fetchmanagerTeam);
managerRouter.get("/fetch-manager-project", managerCtr.fetchmanagerProjects);
managerRouter.get("/fetch-manager-staff", managerCtr.fetchmanagerstaffmembers);
managerRouter.get("/fetch-manager-roles", managerCtr.fetchmanagerRoles);
managerRouter.get("/fetch-manager-client", managerCtr.fetchmanagerclients);
managerRouter.get(
  "/fetch-manager-projectwithmilestone",
  managerCtr.fetchmanagermilestons
);
managerRouter.post("/create-manager-project", managerCtr.createManagerProject);

module.exports = managerRouter;
