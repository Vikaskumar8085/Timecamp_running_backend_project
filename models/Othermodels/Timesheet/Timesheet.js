const mongoose = require("mongoose");
const {Schema} = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Define the Billing Status constants
const BILLING_STATUS = ["NOT_BILLED", "BILLED", "PARTIALLY_BILLED"]; // Adjust as needed

const TimesheetSchema = new Schema({
  TaskId: {
    type: Number,
    required: false,
    unique: true,
  },
  ts_code: {
    type: String,
    maxlength: 10,
    unique: true,
    sparse: true, // Allows blank entries but maintains uniqueness
  },
  ContractorId: {
    type: Number,
    ref: "Contractor",
    required: false,
  },
  EmployeeId: {
    type: Number,
    ref: "Employee",
    required: false,
  },
  CompanId: {
    type: Number,
    ref: "Company",
    default: null,
    required: false,
  },
  hours: {
    type: String,
    default: 0,
  },
  project: {
    type: Number,
    ref: "Project",
    required: true,
  },
  task_description: {
    type: String,
    required: false,
  },
  Description: {
    type: String,
    default: null,
    maxlength: 5000, // Optional: limit the description length
  },
  start_time: {
    type: Date,
    default: null,
  },
  end_time: {
    type: Date,
    default: null,
  },
  day: {
    type: Date,
    required: false,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  remarks: {
    type: String,
    default: null,
    maxlength: 5000, // Optional
  },
  approval_status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  billing_status: {
    type: String,
    enum: BILLING_STATUS,
    default: "NOT_BILLED",
  },
  approved_date: {
    type: Date,
    default: null,
  },
  approved_by: {
    type: Number,
    ref: "User ",
    default: null,
  },
  billed_hours: {
    type: Number,
    default: 0,
  },
  ok_hours: {
    type: Number,
    default: 0,
  },
  blank_hours: {
    type: Number,
    default: 0,
  },
});

// Create the model from the schema
TimesheetSchema.plugin(AutoIncrement, {
  inc_field: "TaskId",
  start_seq: 1,
});

// Method to generate unique ts_code
TimesheetSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.model("TimeSheet").countDocuments();
    this.ts_code = `TS${String(count + 1).padStart(3, "0")}`; // Generate ts_code like "TS001"
  }
  next();
});

const TimeSheet = mongoose.model("TimeSheet", TimesheetSchema);

module.exports = TimeSheet;
