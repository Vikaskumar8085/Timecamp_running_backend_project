const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const NotificationSchema = mongoose.Schema(
  {
    Notification_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    SenderId: {
      type: Number,
      default: null,
    },
    ReciverId: {
      type: Number,
      default: null,
    },
    Name: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    IsRead: {
      type: Boolean,
      required: true,
      default: false,
    },
    click: {
      type: String,
      default: "",
    },
  },
  {timestamps: true}
);

NotificationSchema.plugin(AutoIncrement, {
  inc_field: "Notification_Id",
  start_seq: 1,
});

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
