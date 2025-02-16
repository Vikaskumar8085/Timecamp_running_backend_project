const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcryptjs");

const ClientRegistrationSchema = mongoose.Schema(
  {
    Client_Id: {
      type: Number,
      unique: true,
      trim: true,
    },
    Company_Name: {
      type: String,
      required: false,
    },
    Client_Name: {
      type: String,
      required: false,
    },
    Client_Email: {
      type: String,
      required: false,
    },
    Client_Phone: {
      type: String,
      required: false,
    },
    Password: {
      type: String,
      required: false,
    },
    Client_Address: {
      type: String,
      required: false,
    },
    Client_Postal_Code: {
      type: Number,
      required: false,
    },
    GstNumber: {
      type: String,
      required: false,
    },
    Role: {
      type: String,
      default: "Client",
    },
    System_Access: {
      type: Boolean,
      required: true,
      deafult: false,
    },
    Common_Id: {
      type: Number,
      required: false,
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

ClientRegistrationSchema.pre("save", async function (next) {
  if (this.Password) {
    this.Password = await bcrypt.hash(this.Password, 10);
  } else if (this.Client_Phone) {
    const hashedPassword = await bcrypt.hash(this.Client_Phone, 10);
    this.Password = hashedPassword;
  }
  next();
});

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
