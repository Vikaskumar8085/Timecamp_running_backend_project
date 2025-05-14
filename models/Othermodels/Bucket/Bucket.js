const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const bucketSchema = new mongoose.Schema({
  bucket_id: {
    type: Number,
    unique: true,
    trim: true,
  },
  ProjectId: {
    type: Number,
  },
  bucketHourlyRate: {
    type: String,
  },
  bucketHourly: {
    type: Number,
  },
});

// Auto-increment plugin applied to bucket_id field
bucketSchema.plugin(AutoIncrement, {
  inc_field: "bucket_id",
  start_seq: 1,
});

const Bucket = mongoose.model("Bucket", bucketSchema);
module.exports = Bucket;
