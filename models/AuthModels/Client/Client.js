const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ClientRegistrationSchema = mongoose.Schema(
  {
    Client_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    Company_Name: {
      type: String,
      required: true,
    },
    Client_Email: {
      type: String,
      required: true,
    },
    Client_Phone: {
      type: String,
      required: true,
    },
    Client_Address: {
      type: String,
      required: true,
    },
    Client_Postal_Code: {
      type: Number,
      required: true,
    },

    GstNumber: {
      type: String,
      required: true,
    },

    Common_Id: {
      type: Number,
      required: true,
    },
    Client_Status: {
      type: String,
      enum: ["Active", "InActive", "Dead"],
      default: "InActive",
    },
  },
  {
    timestamps: true,
  }
);

ClientRegistrationSchema.plugin(AutoIncrement, {
  inc_field: "Client_Id",
  start_seq: 1,
});

const Client = mongoose.model("Client", ClientRegistrationSchema);
module.exports = Client;
