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
    UserName: {
      type: String,
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
    DesignationId: {
      type: String,
      trim: true,
    },
    Role: {
      type: String,
      enum: ["Employee", "Contractor", "Manager"],
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
    ManagerId: {
      type: Number,
      default: null,
    },
    Permission: {
      type: Boolean,
      required: false,
      default: false,
    },
    Backlog_Entries: {
      type: Number,
      required: false,
      default: 0,
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

    Photos: [
      {
        type: String,
      },
    ],

    //
  },
  {timestamps: true}
);

staffMemberSchema.plugin(AutoIncrement, {
  inc_field: "staff_Id",
  start_seq: 1,
});

staffMemberSchema.pre("save", async function (next) {
  if (
    this.isNew ||
    this.isModified("FirstName") ||
    this.isModified("LastName")
  ) {
    let prefix = `${this.FirstName.charAt(
      0
    ).toLowerCase()}${this.LastName.toLowerCase()}`;
    let baseUserName = `${this.FirstName.toLowerCase()}_${this.LastName.toLowerCase()}`; // Special char (_)
    let randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    let uniqueUserName = `${prefix}.${baseUserName}${randomNum}`;
    let counter = 1;

    // Ensure uniqueness in the database
    while (await StaffMember.findOne({UserName: uniqueUserName})) {
      uniqueUserName = `${prefix}.${baseUserName}${randomNum + counter}`;
      counter++;
    }

    this.UserName = uniqueUserName;
  }
  next();
});

const StaffMember = mongoose.model("StaffMember", staffMemberSchema);

module.exports = StaffMember;
