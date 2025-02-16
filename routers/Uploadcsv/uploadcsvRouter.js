const express = require("express");
const csvuploadCtr = require("../../controller/Authcontrollers/Csvupload/csvuploadCtr");
const upload = require("../../utils/FileUpload/fileUpload");
const verifyToken = require("../../Auth/verifyAuth");
// const upload
const uploadcsvRouter = express.Router();
// client
uploadcsvRouter.get(
  "/client-csv-download",
  verifyToken,
  csvuploadCtr.generateClientCsvFile
);

uploadcsvRouter.post(
  "/upload-csv-client",
  verifyToken,
  upload.single("file"),
  csvuploadCtr.uploadclientcsv
);
// contractor
uploadcsvRouter.get(
  "/contractor-csv-download",
  verifyToken,
  csvuploadCtr.generateContractorcsv
);
uploadcsvRouter.post(
  "/contractor-csv-upload",
  verifyToken,
  upload.single("file"),
  csvuploadCtr.uploadcontractorcsv
);
// contractor
// employee
uploadcsvRouter.get(
  "/employee-csv-download",
  verifyToken,
  csvuploadCtr.generateEmployeecsv
);

uploadcsvRouter.post(
  "/employee-csv-upload",
  verifyToken,
  upload.single("file"),
  csvuploadCtr.uploademployeecsv
);
// employee

uploadcsvRouter.get(
  "/project-csv-download",
  verifyToken,
  csvuploadCtr.generateProjectcsv
);

// employee

uploadcsvRouter.get(
  "/timesheet-csv-download",
  verifyToken,
  csvuploadCtr.generateTimesheetcsv
);

uploadcsvRouter.post(
  "/timesheet-csv-upload",
  upload.single("file"),
  verifyToken,
  csvuploadCtr.uploadTimesheetCsv
);

//
uploadcsvRouter.get(
  "/task-csv-download",
  verifyToken,
  csvuploadCtr.generateTaskcsv
);

module.exports = uploadcsvRouter;
