const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const CompanySchema = mongoose.Schema({
  Company_Id: {
    type: Number,
    trim: true,
    unique: true,
  },
  Company_Name: {
    type: String,
  },
  Company_Email: {
    type: String,
    unique: true,
  },
  Person_Phones: {
    type: Number,
  },
  Person_Name: {
    type: String,
  },
  Person_Email: {
    type: String,
  },
  Address: {
    type: String,
  },
  Postal_Code: {
    type: String,
  },
  Phone: {
    type: Number,
  },
  Company_Logo: {
    type: String,
    required: false,
  },
  Employee_No: {
    type: Number,
    default: "",
  },
  Established_date: {
    type: String,
    // required: true,
  },
  CompanyWesite: {
    type: String,
  },
  Tex_Number: {
    type: String,
  },
  UserId: [
    {
      type: Number,
      required: true,
    },
  ],
});

CompanySchema.plugin(AutoIncrement, {
  inc_field: "Company_Id",
  start_seq: 1,
});

const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;

// {
//   "Company_Name": "Acme Corporation",
//   "Company_Email": "info@acmecorp.com",
//   "Address": "456 Corporate Ave",
//   "Postal_Code": "12345",
//   "Phone": 1234567890,
//   "Company_Logo": "https://example.com/logo.png",
//   "Employee_No": 50,
//   "Established_date": "2023",
//   "CompanyWesite": "https://acmecorp.com",
//   "Tex_Number": "TX123456",
//   "UserId": [1, 2, 3]
// }
