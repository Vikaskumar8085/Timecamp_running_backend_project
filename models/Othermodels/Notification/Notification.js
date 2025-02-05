const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const NotificationSchema = mongoose.Schema(
  {
    Notification_Id: {
      type: Number,
      unique: true,
      trim: true,
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
  },
  {timestamps: true}
);

NotificationSchema.plugin(AutoIncrement, {
  inc_field: "Notification_Id",
  start_seq: 1,
});

const Notification = mongoose.model("NotificationSchema", Notification);
module.exports = Notification;
