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
    required: true,
  },
  Company_Email: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  Postal_Code: {
    type: String,
    required: true,
  },
  Phone: {
    type: Number,
    required: true,
  },
  Company_Logo: {
    type: String,
    required: true,
  },
  Employee_No: {
    type: Number,
    required: true,
    default: "",
  },
  Established_date: {
    type: String,
    // required: true,
  },
  CompanyWesite: {
    type: String,
    required: true,
  },
  Tex_Number: {
    type: String,
    required: true,
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
