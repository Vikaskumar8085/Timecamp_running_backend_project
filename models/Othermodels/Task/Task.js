const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const TaskSchema = new mongoose.Schema(
  {
    task_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    Company_Id: {
      type: Number,
      ref: "Company",
      required: false,
      unquie: true,
      trim: true,
    },
    Task_Name: {
      type: String,
      required: true,
      maxlength: 255,
      default: "",
    },
    ProjectId: {
      type: Number,
      ref: "Project",
      required: true,
    },
    Project_Code: {
      type: String,
      required: true,
    },
    MilestoneId: {
      type: String,
      ref: "Milestone",
      required: true,
    },
    Priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    StartDate: {
      type: Date,
      required: true,
    },
    EndDate: {
      type: Date,
      required: true,
    },
    Status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
    },
    Estimated_Time: {
      type: Number,
      min: 0,
      default: null,
    },
    Due_date: {
      type: Date,
      default: null,
    },
    Completed_time: {
      type: Number,
      min: 0,
      default: null,
    },
    Resource_Email: {
      type: String,
    },

    Task_description: {
      type: String,
      required: true,
    },
    Attachment: {
      type: String,
      default: null, // Store path or URL to the attachment
    },
    Description: {
      type: String,
      default: null,
    },
  },
  {timestamps: true}
);

TaskSchema.plugin(AutoIncrement, {inc_field: "task_Id", start_seq: 1});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
