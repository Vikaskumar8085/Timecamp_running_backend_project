const express = require("express");
const verifyToken = require("../../Auth/verifyAuth");
const admindashboardCtr = require("../../controller/Authcontrollers/admin/admindashboardCtr");

const admindashRouter = express.Router();

admindashRouter.get(
  "/dashboard-data",
  verifyToken,
  admindashboardCtr.fetchtotalCounter
);
admindashRouter.get(
  "/fetch-dash-recent-project",
  verifyToken,
  admindashboardCtr.fetchrecentproject
);
admindashRouter.get(
  "/fetch-dash-billed-notbilled",
  verifyToken,
  admindashboardCtr.fetchbilledandnotbilledhours
);

admindashRouter.get(
  "/fetch-dash-hours-by-projects",
  verifyToken,
  admindashboardCtr.fetchHoursbyproject
);

admindashRouter.get(
  "/fetch-dash-daily-hours",
  verifyToken,
  admindashboardCtr.fetchdaybytotalhours
);

admindashRouter.get(
  "/fetch-dash-hours-by-company",
  verifyToken,
  admindashboardCtr.fetchhoursbycompany
);

admindashRouter.get(
  "/fetch-dash-project-time-utilization",
  verifyToken,
  admindashboardCtr.fetchprojectecttimeutilize
);

admindashRouter.get(
  "/fetch-dash-approvel-by-billed-and-total-hours",
  verifyToken,
  admindashboardCtr.fetchapprovelbybilledhours
);
module.exports = admindashRouter;
