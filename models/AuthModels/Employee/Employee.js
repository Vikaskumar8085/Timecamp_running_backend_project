const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const EmployeeSchema = new mongoose.Schema(
  {
    EmployeeId: {
      type: Number,
      trim: true,
      unique: true,
    },
    CompanyId: {
      type: Number,
      required: false,
    },
    FirstName: {
      type: String,
      required: true,
    },
    LastName: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    Phone: {
      type: String,
      trim: true,
      default: "",
    },
    Address: {
      type: String,
      trim: true,
      default: "",
    },
    Joining_Date: {
      type: String,
      required: true,
      trim: true,
      required: false,
    },
    IsActive: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
    },

    Password: {
      type: String,
      required: false,
    },
    Designation: {
      type: String,
      required: true,
      trim: false,
    },
    Role: [
      {
        type: String,
        enum: ["Employee", "Manager", "Contractor", "ContractorManager"],
        default: "Employee",
        required: true,
      },
    ],
    Manager: {
      ManagerId: {
        type: Number,
        default: null,
      },
      Manager_Name: {
        type: String,
        default: "",
      },
    },
    Permission: {
      type: Boolean,
      required: false,
    },
    Backlog_Entries: {
      type: Number,
      required: false,
      default: 1,
    },
    Socail_Links: {
      type: String,
      required: false,
    },
    Contractor_Company: {
      type: String,
    },
    Hourly_Rate: {
      type: Number,
    },
    Supervisor: {
      type: String,
    },
    Phone: {
      type: String,
      // required: true,
    },
    Photos: [
      {
        type: String, // You could also use a more complex structure to handle image uploads
      },
    ],
  },
  {timestamps: true}
); // Automatically add createdAt and updatedAt fields

EmployeeSchema.plugin(AutoIncrement, {
  inc_field: "EmployeeId",
  start_seq: 1,
});
const Employee = mongoose.model("Employee", EmployeeSchema);

module.exports = Employee;
