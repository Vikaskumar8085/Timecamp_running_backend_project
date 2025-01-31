const express = require("express");
const csvuploadCtr = require("../../controller/Authcontrollers/Csvupload/csvuploadCtr");
const upload = require("../../utils/FileUpload/fileUpload");
// const upload
const uploadcsvRouter = express.Router();

uploadcsvRouter.post(
  "/upload-csv-client",
  upload.single("file"),
  csvuploadCtr.uploadclientcsv
);

module.exports = uploadcsvRouter;
