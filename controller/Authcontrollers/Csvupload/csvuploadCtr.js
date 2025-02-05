const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const Client = require("../../../models/AuthModels/Client/Client");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const csvParser = require("csv-parser");
const xlsx = require("xlsx");
const mongoose = require("mongoose");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const csvuploadCtr = {
  generateClientCsvFile: asyncHandler(async (req, res) => {
    try {
      const schemaFields = Object.keys(Client.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "Common_Id" &&
          field !== "_V" &&
          field !== "Role" &&
          field !== "Client_Id" &&
          field !== "Password" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "schema_fields.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "schema_fields.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  generateEmployeecsv: asyncHandler(async (req, res) => {
    try {
      // const checkemployee = await

      const schemaFields = Object.keys(StaffMember.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "CompanyId" &&
          field !== "_V" &&
          field !== "staff_Id" &&
          field !== "IsActive" &&
          field !== "Password" &&
          field !== "Role" &&
          field !== "SubRole" &&
          field !== "SubRole" &&
          field !== "Manager" &&
          field !== "Manager.ManagerId" &&
          field !== "Manager.Manager_Name" &&
          field !== "Permission" &&
          field !== "Backlog_Entries" &&
          field !== "Photos" &&
          field !== "Password" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "Employee.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "Employee.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   generate contractor csv
  generateContractorcsv: asyncHandler(async (req, res) => {
    try {
      // const checkemployee = await

      const schemaFields = Object.keys(StaffMember.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "CompanyId" &&
          field !== "_V" &&
          field !== "staff_Id" &&
          field !== "IsActive" &&
          field !== "Password" &&
          field !== "Role" &&
          field !== "SubRole" &&
          field !== "SubRole" &&
          field !== "Manager" &&
          field !== "Manager.ManagerId" &&
          field !== "Manager.Manager_Name" &&
          field !== "Permission" &&
          field !== "Backlog_Entries" &&
          field !== "Photos" &&
          field !== "Password" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "contractor.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "contractor.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   generate Project csv
  generateProjectcsv: asyncHandler(async (req, res) => {
    try {
      // const checkemployee = await

      const schemaFields = Object.keys(Client.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "Common_Id" &&
          field !== "_V" &&
          field !== "Role" &&
          field !== "Client_Id" &&
          field !== "Password" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "schema_fields.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "schema_fields.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // generate Task csv
  generateTaskcsv: asyncHandler(async (req, res) => {
    try {
      // const checkemployee = await

      const schemaFields = Object.keys(Client.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "Common_Id" &&
          field !== "_V" &&
          field !== "Role" &&
          field !== "Client_Id" &&
          field !== "Password" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "schema_fields.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "schema_fields.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   Timesheet csv
  generateTimesheetcsv: asyncHandler(async (req, res) => {}),

  uploadclientcsv: asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({error: "No file uploaded."});
      }
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const insertdata = [];

      for await (let newdata of data) {
        const clientdata = await Client(newdata);
        const saveclient = await clientdata.save();
        insertdata.push(saveclient);
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: insertdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  uploadcontractorcsv: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  uploademployeecsv: asyncHandler(async (req, res) => {
    try {
    } catch (error) {}
  }),
  uploadTaskcsv: asyncHandler(async (req, res) => {
    try {
    } catch (error) {}
  }),
  uploadprojectCsv: asyncHandler(async (req, res) => {
    try {
    } catch (error) {}
  }),
  uploadTimesheetCsv: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = csvuploadCtr;

// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const path = require('path');

// // Initialize Express app
// const app = express();
// const port = 3000;

// // Set up multer storage engine
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');  // specify the folder to store files
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));  // set a unique file name
//   },
// });

// const upload = multer({ storage });

// // Endpoint to handle file upload
// app.post('/upload', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({
//       success: false,
//       message: 'No file uploaded.',
//     });
//   }

//   // Process the uploaded file
//   const filePath = req.file.path;
//   const workbook = xlsx.readFile(filePath);

//   // Convert the first sheet to JSON
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];
//   const data = xlsx.utils.sheet_to_json(sheet);

//   // Validate for duplicates (assumes `uniqueId` is the unique column)
//   const seen = new Set();
//   const duplicates = [];

//   data.forEach((row, index) => {
//     if (seen.has(row.uniqueId)) {
//       duplicates.push({
//         row,
//         index,
//       });
//     } else {
//       seen.add(row.uniqueId);
//     }
//   });

//   if (duplicates.length > 0) {
//     // Return an error response with the duplicate details
//     return res.status(400).json({
//       success: false,
//       message: 'Duplicate data found.',
//       duplicates: duplicates.map(duplicate => ({
//         index: duplicate.index,
//         row: duplicate.row,
//       })),
//     });
//   }

//   // If no duplicates, return the data
//   res.json({
//     success: true,
//     data,
//   });
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
