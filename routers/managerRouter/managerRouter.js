const express = require("express");
const managerCtr = require("../../controller/ManagerCtr/ManagerController");
const verifyToken = require("../../Auth/verifyAuth");

const managerRouter = express.Router();
managerRouter.use(verifyToken);
managerRouter.get("/fetch-manager-team", managerCtr.fetchmanagerTeam);
managerRouter.get("/fetch-manager-staff", managerCtr.fetchmanagerProjects);
module.exports = managerRouter;
