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
    Username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    Client_Name: {
      type: String,
      required: false,
    },
    Client_Email: {
      type: String,
      trim: true,
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
      match: [
        /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
        "Please enter a valid GST Number",
      ],
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

// export async function generateUniqueClientName(baseName) {
//   let name = baseName.trim().toLowerCase().replace(/\s+/g, "-");
//   let uniqueName = name;
//   let count = 0;

//   while (await Client.findOne({Client_Name: uniqueName})) {
//     count++;
//     uniqueName = `${name}-${count}`;
//   }

//   return uniqueName;
// }
