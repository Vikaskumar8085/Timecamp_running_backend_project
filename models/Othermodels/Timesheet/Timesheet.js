const mongoose = require("mongoose");
const {Schema} = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);
// Define the Billing Status constants
const BILLING_STATUS = ["NOT_BILLED", "BILLED", "PARTIALLY_BILLED"]; // Adjust as needed
const TimesheetSchema = new Schema({
  Timesheet_Id: {
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
  Staff_Id: {
    type: Number,
    ref: "staff_Id",
    required: false,
  },

  CompanyId: {
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
    default: "none",
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
  inc_field: "Timesheet_Id",
  start_seq: 1,
});

TimesheetSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.model("TimeSheet").countDocuments();

    // Calculate the prefix (e.g., TSA, TSB, TSC, etc.)
    const prefixIndex = Math.floor(count / 1000);
    const prefixLetter = String.fromCharCode(65 + prefixIndex); // Convert index to A, B, C, ...
    const prefix = `TS${prefixLetter}`;

    // Generate the sequential number (001, 002, ..., 999)
    const sequenceNumber = (count % 1000) + 1;
    const formattedNumber = String(sequenceNumber).padStart(3, "0");

    // Combine prefix and sequence number
    this.ts_code = `${prefix}${formattedNumber}`;
  }

  // Calculate total hours
  const totalHours = this.ok_hours + this.billed_hours + this.blank_hours;

  if (totalHours !== this.hours) {
    return next(
      new Error(`Total hours must be exactly hour, but got ${totalHours}`)
    );
  }
  this.hours = totalHours;
  next();
});

const TimeSheet = mongoose.model("TimeSheet", TimesheetSchema);

module.exports = TimeSheet;
