const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const WeekoffSettingSchema = mongoose.Schema(
  {
    WeekoffSetting_Id: {
      type: Number,
      trim: true,
      unique: true,
    },
    CompanyId: {
      type: Number,
      required: true,
    },
    Week_Off_Days: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      validate: {
        validator: function (arr) {
          return !this.AllowbacklogEntryOnWeekOff || arr.length > 0;
        },
        message:
          "Week_Off_Days must not be empty when AllowbacklogEntryOnWeekOff is true.",
      },
    },
    AllowbacklogEntryOnWeekOff: {
      type: Boolean,
      deafult: false,
    },
  },
  {
    timestamps: true,
  }
);

WeekoffSettingSchema.plugin(AutoIncrement, {
  inc_field: "WeekoffSetting_Id",
  start_seq: 1,
});

const WeekoffSetting = mongoose.model("WeekoffSetting", WeekoffSettingSchema);
module.exports = WeekoffSetting;
