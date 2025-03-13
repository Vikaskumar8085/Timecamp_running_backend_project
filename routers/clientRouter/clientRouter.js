const express = require("express");
const ClientCtr = require("../../controller/ClientCtr/ClientCtr");
const verifyToken = require("../../Auth/verifyAuth");
const clientdashctr = require("../../controller/ClientCtr/clientdashboardCtr");

const clientRouter = express.Router();

clientRouter.use(verifyToken);

clientRouter.get("/client-project", ClientCtr.fetchClientprojects);
clientRouter.get("/client-active-project", ClientCtr.fetchclientActiveProjects);
clientRouter.get(
  "/client-inactive-project",
  ClientCtr.fetchclientInactiveprojects
);
clientRouter.get("/client-project-task/:id", ClientCtr.fetchclientprojecttask);
clientRouter.get(
  "/client-project-timesheet/:id",
  ClientCtr.fetchclientprojectTimesheet
);

clientRouter.get(
  "/client-single-project/:id",
  ClientCtr.fetchclientSingleproject
);

clientRouter.put("/client-approve-timesheet/:id", ClientCtr.approvetimesheet);
clientRouter.put(
  "/client-disapprove-timesheet/:id",
  ClientCtr.disapprovetimesheet
);
// task
clientRouter.get("/client-project-task", ClientCtr.fetchClientTask);

// timesheet
clientRouter.get("/client-project-timesheet", ClientCtr.fetchClientTimesheet);
clientRouter.get(
  "/fetch-client-notification",
  ClientCtr.fetchClientNotification
);

// dashboard

clientRouter.get("/client-dash-counter", clientdashctr.clientdashcounter);
clientRouter.get(
  "/fetch-client-recent-project",
  clientdashctr.clientdashboardRecentProject
);
module.exports = clientRouter;
