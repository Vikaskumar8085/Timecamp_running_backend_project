const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const bucketSchema = new mongoose.Schema({
  bucket_id: {
    type: Number,
    trim: true,
    unique: true,
  },
  ProjectId: {type: Number, ref: "Project", required: false},
  bucketHourlyRate: {
    type: String,
    required: false,
  },
  bucketHourly: {
    type: Number,
    required: false,
  },
});

// Apply the auto-increment plugin to the _id field
bucketSchema.plugin(AutoIncrement, {
  inc_field: "bucket_id",
  start_seq: 1,
});

const Bucket = mongoose.model("Bucket", bucketSchema);
module.exports = Bucket;
