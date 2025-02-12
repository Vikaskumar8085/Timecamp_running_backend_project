const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);
const bucketSchema = new mongoose.Schema({
  bucket_id: {
    type: Number,
    required: true,
    unique: true,
  },
  ProjectId: {type: Number, ref: "Project", required: true},
  bucketHourlyRate: {
    type: String,
    required: true,
  },
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
