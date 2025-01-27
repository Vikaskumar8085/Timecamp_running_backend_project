const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const DepartmentSchema = mongoose.Schema(
  {
    Department_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    CompanyId: {
      type: Number,
      required: true,
    },
    Department_Name: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
);

DepartmentSchema.plugin(AutoIncrement, {
  inc_field: "Department_Id",
  start_seq: 1,
});

const Department = mongoose.model("Department", DepartmentSchema);
module.exports = Department;
