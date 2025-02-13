const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const moment = require("moment");

const ProjectSchema = mongoose.Schema({
  CompanyId: {
    type: Number,
    ref: "Company",
    required: true,
  },
  ProjectId: {
    type: Number,
    unique: true,
    trim: true,
  },
  Project_Name: {
    type: String,
    required: false,
    trim: true,
  },
  Project_Code: {
    type: String,
    trim: true,
  },
  Start_Date: {
    type: String,
    default: moment().format("DD/MM/YYYY"),
  },
  End_Date: {
    type: String,
    default: function () {
      return moment().format("DD/MM/YYYY");
    },
  },
  clientId: {
    type: Number,
    required: false,
  },

  Project_Type: {
    type: String,
    required: false,
  },
  Project_Hours: {
    type: String,
    required: false,
  },

  Project_Status: {
    type: Boolean,
    required: false,
    default: false,
  },

  Project_ManagersId: {
    type: Number,
    required: false,
  },
});

ProjectSchema.plugin(AutoIncrement, {
  inc_field: "ProjectId",
  start_seq: 1,
});

// Method to generate unique Project_Code
ProjectSchema.pre("save", async function (next) {
  // Generate unique Project_Code
  const projectCount = await Project.countDocuments();
  this.Project_Code = `PRJ${String(projectCount + 1).padStart(3, "0")}`;
  next();
});

// Define custom validation for Project_Code
// ProjectSchema.path("Project_Code").validate(function (value) {
//   // Check if Project_Code is in the correct format
//   const regex = /^PRJ\d{3}$/;
//   return regex.test(value);
// }, "Invalid Project_Code format");

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
