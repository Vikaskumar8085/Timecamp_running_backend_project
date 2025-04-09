const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const HolidaylistSchema = mongoose.Schema(
  {
    Holiday_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    Company_Id: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    Name: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
);

HolidaylistSchema.plugin(AutoIncrement, {
  inc_field: "Holiday_Id",
  start_seq: 1,
});

const Holidaylist = mongoose.model("Holidaylist", HolidaylistSchema);
module.exports = Holidaylist;
