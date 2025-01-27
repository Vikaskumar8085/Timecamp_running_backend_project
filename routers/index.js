const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const adminRouter = require("./adminRouter/adminRouter");
const DataModel = require("../models/Datamodel");
const ChartData = require("../models/Chart");

const upload = multer({dest: "uploads/"});

const indexRouter = express.Router();

indexRouter.post("/upload", upload.single("file"), async (req, res) => {
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
          name: row.name,
          email: row.email,
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
          await DataModel.bulkWrite(bulkOps);
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
    res.status(500).json({error: "An unexpected error occurred."});
  }
});

// chart data

indexRouter.get("/chart-data", async (req, res) => {
  try {
    const data = await ChartData.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({error: "Failed to fetch chart data"});
  }
});

// Endpoint to add sample data (optional for testing)
indexRouter.post("/chart-data", async (req, res) => {
  try {
    const newData = new ChartData(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(500).json({error: "Failed to save chart data"});
  }
});

module.exports = indexRouter;
