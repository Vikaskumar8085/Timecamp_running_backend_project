const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const DesignationSchema = mongoose.Schema(
  {
    Designation_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    CompanyId: {
      type: Number,
      required: true,
    },
    Designation_Name: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
);

DesignationSchema.plugin(AutoIncrement, {
  inc_field: "Designation_Id",
  start_seq: 1,
});

const Designation = mongoose.model("Designation", DesignationSchema);
module.exports = Designation;
