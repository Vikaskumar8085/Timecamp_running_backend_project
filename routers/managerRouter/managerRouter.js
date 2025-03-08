const express = require("express");
const managerCtr = require("../../controller/ManagerCtr/ManagerController");
const verifyToken = require("../../Auth/verifyAuth");
const upload = require("../../utils/FileUpload/fileUpload");
const managerRouter = express.Router();
managerRouter.use(verifyToken);
managerRouter.get("/fetch-manager-team", managerCtr.fetchmanagerTeam);
managerRouter.get("/fetch-manager-project", managerCtr.fetchmanagerProjects);
managerRouter.get(
  "/fetch-manager-active-project",
  managerCtr.fetchmanagerActiveprojects
);
managerRouter.get(
  "/fetch-manager-inactive-project",
  managerCtr.fetchmanagerInActiveprojects
);
managerRouter.get("/fetch-manager-staff", managerCtr.fetchmanagerstaffmembers);
managerRouter.get("/fetch-manager-roles", managerCtr.fetchmanagerRoles);
managerRouter.get("/fetch-manager-client", managerCtr.fetchmanagerclients);
managerRouter.post(
  "/create-manager-task",
  upload.single("file"),
  managerCtr.createtaskbymanager
);
managerRouter.get(
  "/fetch-manager-projectwithmilestone",
  managerCtr.fetchmanagermilestons
);
managerRouter.post("/create-manager-project", managerCtr.createManagerProject);
managerRouter.post(
  "/fill-manager-timesheet",
  upload.array("file"),
  managerCtr.FillManagerProjectTimesheet
);
managerRouter.delete(
  "/remove-manager-timesheet",
  managerCtr.RemovemanagerTimesheet
);
managerRouter.post("/send-for-approvel-manager-timesheet");
managerRouter.get(
  "/fetch-manager-notification",
  managerCtr.fetchManagerNotification
);

// fetch manger task
managerRouter.get("/fetch-manager-task", managerCtr.fetchmanagertasks);
managerRouter.get("/timesheet", managerCtr.fetchmanagertimesheet);

managerRouter.get(
  "/fetch-manager-projectinfo/:id",
  managerCtr.fetchprojectinfo
);
managerRouter.get(
  "/fetch-manager-prject-timesheets/:id",
  managerCtr.fetchmanagerprojecttimesheet
);

managerRouter.get(
  "/fetch-manager-project-task/:id",
  managerCtr?.fetchmanagerprojecttasks
);

// create milestone

managerRouter.post(
  "/create-manager-project-milestone/:projectId",
  managerCtr.createmanagermilestone
);

managerRouter.post(
  "/create-manager-project-task/:id",
  upload.single("file"),
  managerCtr.addProjectTask
);
managerRouter.get(
  "/fetch-manager-project-milestone/:id",
  managerCtr.fetchmanagerprojectmilestones
);
managerRouter.get(
  "/fetch-manager-project-time",
  managerCtr.fetch_manager_project_time
);
module.exports = managerRouter;
