const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const RoleSchema = mongoose.Schema(
  {
    RoleId: {
      type: Number,
      unique: true,
      trim: true,
    },
    CompanyId: {
      type: Number,
      required: true,
    },
    RoleName: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.plugin(AutoIncrement, {
  inc_field: "RoleId",
  start_seq: 1,
});

const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
