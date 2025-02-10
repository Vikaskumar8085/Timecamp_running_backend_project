const express = require("express");
const ClientCtr = require("../../controller/ClientCtr/ClientCtr");
const verifyToken = require("../../Auth/verifyAuth");

const clientRouter = express.Router();

clientRouter.use(verifyToken);

clientRouter.get("/client-project", ClientCtr.fetchClientprojects);
clientRouter.get("/client-active-project", ClientCtr.fetchclientActiveProjects);
clientRouter.get(
  "/client-inactive-project",
  ClientCtr.fetchclientInactiveprojects
);
clientRouter.get("/client-project-task", ClientCtr.fetchclientprojectTask);

module.exports = clientRouter;
