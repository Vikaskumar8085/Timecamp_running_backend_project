const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const staffMemberSchema = mongoose.Schema(
  {
    staff_Id: {
      type: Number,
      unique: true,
      trim: true,
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
      trim: false,
    },

    //
    Role: {
      type: String,
      enum: ["Employee", "Contractor"],
      default: "Employee",
      required: true,
    },
    SubRole: [
      {
        type: String,
        enum: ["Manager", "ContractorManager"],
        default: "",
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

    //
  },
  { timestamps: true }
);

staffMemberSchema.plugin(AutoIncrement, {
  inc_field: "staff_Id",
  start_seq: 1,
});

const StaffMember = mongoose.model("StaffMember", staffMemberSchema);

module.exports = StaffMember;
