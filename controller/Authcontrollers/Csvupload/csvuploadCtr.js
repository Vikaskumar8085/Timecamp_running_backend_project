const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Client = require("../../../models/AuthModels/Client/Client");

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

  uploadclientcsv: asyncHandler(async (req, res) => {
    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({error: "No file uploaded"});
      }
      // Validate file type (allow only CSV)
      const fileType = req.file.mimetype;
      if (fileType !== "text/csv" && fileType !== "application/vnd.ms-excel") {
        fs.unlinkSync(req.file.path); // Delete invalid file
        return res
          .status(400)
          .json({error: "Invalid file type. Please upload a CSV file."});
      }
      const filePath = req.file.path;
      const bulkOps = []; // Array to store bulk operations
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          // Convert row fields to match the database schema
          const document = {
            Company_Name: row.Company_Name,
            Client_Name: row.Client_Name,
            age: parseInt(row.age, 10), // Convert age to a number
          };
          // Push update operation into bulkOps
          bulkOps.push({
            updateOne: {
              filter: {email: document.email}, // Use email as the unique identifier
              update: {$set: document},
              upsert: true, // Insert the document if it doesn't exist
            },
          });
        })
        .on("end", async () => {
          try {
            // Perform bulk write operation
            await Client.bulkWrite(bulkOps);
            fs.unlinkSync(filePath); // Delete file after processing
            res.json({message: "CSV uploaded and data updated successfully"});
          } catch (dbError) {
            fs.unlinkSync(filePath); // Ensure file is deleted
            res.status(500).json({error: "Error saving data to the database."});
          }
        })
        .on("error", (parseError) => {
          fs.unlinkSync(filePath); // Ensure file is deleted
          res.status(500).json({error: "Error parsing the CSV file."});
        });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = csvuploadCtr;
