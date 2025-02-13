const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const adminRouter = require("./adminRouter/adminRouter");
const DataModel = require("../models/Datamodel");
const ChartData = require("../models/Chart");

const jwt = require("jsonwebtoken");
const userRouter = require("./userRouter/userRouter");
const masterRouter = require("./masterRouter/masterRouter");
const uploadcsvRouter = require("./Uploadcsv/uploadcsvRouter");
const admindashRouter = require("./adminRouter/admindashRouter");
const clientRouter = require("./clientRouter/clientRouter");
const contractorRouter = require("./contractorRouter/contractorRouter");
const employeeRouter = require("./employeeRouter/employeeRouter");
const projectCtr = require("../controller/Project/projectCtr");
const Project = require("../models/Othermodels/Projectmodels/Project");
const RoleResource = require("../models/Othermodels/Projectmodels/RoleResources");
const milestoneCtr = require("../controller/Milestone/MilestoneCtr");
const MilestoneRouter = require("./MilestornRouter/MilestoneRouter");

const upload = multer({dest: "uploads/"});

const indexRouter = express.Router();

indexRouter.use("/v1/user", userRouter);
indexRouter.use("/v1/admin", adminRouter);
indexRouter.use("/v1/master", masterRouter);
indexRouter.use("/v1/csv-upload", uploadcsvRouter);
indexRouter.use("/v2/admin-dash", admindashRouter);
indexRouter.use("/v2/client", clientRouter);
indexRouter.use("/v2/contractor", contractorRouter);
indexRouter.use("/v2/employee", employeeRouter);
indexRouter.use("/v2/milestone", MilestoneRouter);
// indexRouter.post("/add-project", projectCtr.create_Project);

// indexRouter.get("/fetch-project", async (req, res) => {
//   try {
//     const projects = await Project.find();

//     const projectsWithRoleResources = await Promise.all(
//       projects.map(async (project) => {
//         const roleResources = await RoleResource.find({
//           ProjectId: project.ProjectId,
//         });
//         return {...project.toObject(), roleResources};
//       })
//     );

//     res.status(200).json(projectsWithRoleResources);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({message: "Internal Server Error", error: error.message});
//   }
// });
// index router check authentication

// indexRouter.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check all models for the user
//     const userTypes = [User, Admin, Superadmin, Client];
//     let foundUser = null;
//     let role = null;

//     for (const model of userTypes) {
//       foundUser = await model.findOne({ email });
//       if (foundUser) {
//         role = model.modelName; // Get the model name (e.g., "User", "Admin")
//         break;
//       }
//     }

//     // If user is not found
//     if (!foundUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Validate password

//     const isMatch = await foundUser.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     role === foundUser.role ? "Admin" : null;

//     // Generate token and respond
//     const token = jwt.sign({ id: foundUser }, "secret", { expiresIn: "1d" });
//     res.json({
//       token,
//       user: { id: foundUser._id, email: foundUser.email, role },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "An error occurred during login",
//       error: error.message,
//     });
//   }
// });
// index router check authentication

// indexRouter.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     // Check if file exists
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     // Validate file type (allow only CSV)
//     const fileType = req.file.mimetype;
//     if (fileType !== "text/csv" && fileType !== "application/vnd.ms-excel") {
//       fs.unlinkSync(req.file.path); // Delete invalid file
//       return res
//         .status(400)
//         .json({ error: "Invalid file type. Please upload a CSV file." });
//     }

//     const filePath = req.file.path;
//     const bulkOps = []; // Array to store bulk operations

//     fs.createReadStream(filePath)
//       .pipe(csvParser())
//       .on("data", (row) => {
//         // Convert row fields to match the database schema
//         const document = {
//           name: row.name,
//           email: row.email,
//           age: parseInt(row.age, 10), // Convert age to a number
//         };

//         // Push update operation into bulkOps
//         bulkOps.push({
//           updateOne: {
//             filter: { email: document.email }, // Use email as the unique identifier
//             update: { $set: document },
//             upsert: true, // Insert the document if it doesn't exist
//           },
//         });
//       })
//       .on("end", async () => {
//         try {
//           // Perform bulk write operation
//           await DataModel.bulkWrite(bulkOps);
//           fs.unlinkSync(filePath); // Delete file after processing
//           res.json({ message: "CSV uploaded and data updated successfully" });
//         } catch (dbError) {
//           fs.unlinkSync(filePath); // Ensure file is deleted
//           res.status(500).json({ error: "Error saving data to the database." });
//         }
//       })
//       .on("error", (parseError) => {
//         fs.unlinkSync(filePath); // Ensure file is deleted
//         res.status(500).json({ error: "Error parsing the CSV file." });
//       });
//   } catch (error) {
//     res.status(500).json({ error: "An unexpected error occurred." });
//   }
// });

// chart data

// indexRouter.get("/chart-data", async (req, res) => {
//   try {
//     const data = await ChartData.find();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chart data" });
//   }
// });

// Endpoint to add sample data (optional for testing)
// indexRouter.post("/chart-data", async (req, res) => {
//   try {
//     const newData = new ChartData(req.body);
//     const savedData = await newData.save();
//     res.status(201).json(savedData);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to save chart data" });
//   }
// });

module.exports = indexRouter;

// managed by role type of user crediantials

// const fetchAllProjectsWithRoleResources = async (req, res) => {
//     try {
//       const { page = 1, limit = 10 } = req.query;

//       const projects = await Project.find()
//         .skip((page - 1) * limit)
//         .limit(parseInt(limit));

//       const projectsWithDetails = await Promise.all(
//         projects.map(async (project) => {
//           const roleResources = await RoleResource.find({ ProjectId: project.ProjectId });
//           const rrIds = roleResources.map((rr) => rr.RRId);
//           const rIds = roleResources.map((rr) => rr.RId);

//           const staffMembers = await StaffMember.find({
//             $or: [{ RRId: { $in: rrIds } }, { RId: { $in: rIds } }],
//           });

//           return { ...project.toObject(), roleResources, staffMembers };
//         })
//       );

//       res.status(200).json({ projects: projectsWithDetails, currentPage: page, total: projects.length });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
//   };
