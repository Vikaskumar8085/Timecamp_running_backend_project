const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const MilestoneSchema = new mongoose.Schema({
  Milestone_id: {
    type: Number,
    trim: true,
    required: false,
    unique: true,
  },
  Compnay_Id: {
    type: Number,
    ref: "Company",
    trim: true,
    unique: true,
  },
  ProjectId: {
    type: Number,
    ref: "Project",
    required: true,
  },

  Description: {
    type: String,
    maxlength: 1000,
    default: null,
  },

  Start_date: {
    type: Date,
    default: null,
  },
  End_date: {
    type: Date,
    default: null,
  },
  Is_completed: {
    type: Boolean,
    default: false,
  },
});

MilestoneSchema.plugin(AutoIncrement, {
  inc_field: "Milestone_id",
  start_seq: 1,
});
const Milestone = mongoose.model("Milestone", MilestoneSchema);
module.exports = Milestone;
