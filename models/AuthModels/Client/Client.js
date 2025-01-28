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
    Client_Name: {
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
    Password: {
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
    Role: {
      type: String,
      default: "Client",
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

// {
//   "Company_Name": "Acme Corp",
//   "Client_Name": "John Doe",
//   "Client_Email": "john.doe@example.com",
//   "Client_Phone": "1234567890",
//   "Client_Address": "123 Main St",
//   "Client_Postal_Code": 12345,
//   "GstNumber": "GST123456",
//   "Common_Id": 1
// }
