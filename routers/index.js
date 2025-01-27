const express = require("express");
const adminRouter = require("./adminRouter/adminRouter");

const indexRouter = express.Router();

indexRouter.use("/v1/admin", adminRouter);

module.exports = indexRouter;
