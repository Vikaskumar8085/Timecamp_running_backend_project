const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const RoleResourceSchema = mongoose.Schema(
  {
    RoleResource_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    RRId: {
      type: Number,
      required: true,
    },
    RId: {
      type: Number,
      required: true,
    },
    ProjectId: {
      type: Number,
    },
    Enable: {
      type: Boolean,
    },

    Rate: {
      type: Number,
      default: null,
      set: (val) => (val < 0 ? 0 : val),
    },
    Unit: {
      type: String,
      default: null,
    },
    IsProjectManager: {
      type: Boolean,
      default: true,
    },
    Engagement_Ratio: {
      type: Number,
      default: null,
    },
  },
  {timestamps: true}
);

RoleResourceSchema.plugin(AutoIncrement, {
  inc_field: "RoleResource_Id",
  start_seq: 1,
});
const RoleResource = mongoose.model("RoleResource", RoleResourceSchema);
module.exports = RoleResource;
