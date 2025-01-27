const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

// Initialize the auto-increment plugin
autoIncrement.initialize(mongoose.connection);

const bucketSchema = new mongoose.Schema({
  bucket_id: {
    type: Number,
    required: true,
    unique: true,
  },
  bucket_Date: {
    type: Date,
    required: true,
  },
  transaction: {
    type: String,
    required: true,
  },
  Projects: {type: String, required: true},
  bucketHourly: {
    type: Number,
    required: true,
  },
});

// Apply the auto-increment plugin to the _id field
bucketSchema.plugin(autoIncrement.plugin, {
  model: "Bucket",
  field: "bucket_id",
  startAt: 1,
  incrementBy: 1,
});

module.exports = mongoose.model("Bucket", bucketSchema);
