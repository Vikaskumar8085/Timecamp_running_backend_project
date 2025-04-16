const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const StandardSchema = mongoose.Schema(
  {
    standard_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    Company_Id: {
      type: Number,
      required: true,
    },
    Standard_Hours: {
      type: Number,
      default: null,
    },
  },
  {timestamps: true}
);

StandardSchema.plugin(AutoIncrement, {
  inc_field: "standard_Id",
  start_seq: 1,
});

const Standard = mongoose.model("Standard", StandardSchema);
module.exports = Standard;
