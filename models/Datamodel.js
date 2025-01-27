const mongoose = require("mongoose");
const DataSchema = new mongoose.Schema({
  name: String,
  email: {type: String, required: true, unique: true},
  age: Number,
});
const DataModel = mongoose.model("Data", DataSchema);
module.exports = DataModel;
