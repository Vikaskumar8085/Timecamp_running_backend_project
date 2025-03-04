const express = require("express");
const managerCtr = require("../../controller/ManagerCtr/ManagerController");
const verifyToken = require("../../Auth/verifyAuth");
const upload = require("../../utils/FileUpload/fileUpload");
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
managerRouter.post(
  "/fill-manager-timesheet",
  upload.array("file"),
  managerCtr.FillManagerTimesheet
);

managerRouter.delete(
  "/remove-manager-timesheet",
  managerCtr.RemovemanagerTimesheet
);

managerRouter.post("/send-for-approvel-manager-timesheet");
module.exports = managerRouter;
