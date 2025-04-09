const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const colorSchema = mongoose.Schema(
  {
    Color_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    CompnayId: {
      type: Number,
      required: true,
    },
    Name: {
      type: String,
      required: true,
    },
    min_percentage: {
      type: Number,
      required: true,
    },
    max_percentage: {
      type: Number,
      required: true,
    },
  },
  {timestamps: true}
);

colorSchema.plugin(AutoIncrement, {
  inc_field: "Color_Id",
  start_seq: 1,
});

const Color = mongoose.model("Color", colorSchema);
module.exports = Color;
