const mongoose = require("mongoose");

const ChartDataSchema = new mongoose.Schema({
  label: String,
  startSalary: Number,
  endSalary: Number,
  joiningDate: Date,
});

const ChartData = mongoose.model("ChartData", ChartDataSchema);
module.exports = ChartData;
