const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const UserSchema = mongoose.Schema({
  FirstName: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your FirstName"],
  },
  LastName: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your LastName"],
  },
  Email: {
    type: String,
    unique: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email",
    ],
    required: [true, "Please enter your  email"],
  },
  Password: {
    type: String,
    default: "",
  },
  Phone: {
    type: String,
    required: [true, "Please enter your phone number"],
    trim: true,
  },
  Photo: {
    type: String,
    required: [true, "Please add a photo"],
    default: "https://i.ibb.co/4pDNDk1/avatar.png",
  },
  Role: {
    type: String,
    enum: ["Admin", "Manager", "Employee", "Contractor", "SuperAdmin"],
    default: "Admin",
  },
  Activity: {
    type: Boolean,
    required: true,
    default: false,
  },
  BlockStatus: {
    type: String,
    enum: ["Block", "Unblock"],
    default: "Unblock",
  },
  Term: {
    type: Boolean,
    required: true,
    default: false,
  },
  isVerify: {
    type: Boolean,
    required: true,
    default: false,
  },
  IsAdmin: {
    type: Boolean,
    default: false,
  },
  user_id: {
    type: Number,
    unique: true,
    trim: true,
  },
});

UserSchema.plugin(AutoIncrement, {
  inc_field: "user_id",
  start_seq: 1,
});

UserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("Password") && this.Password) {
      this.Password = await bcrypt.hash(this.Password, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
