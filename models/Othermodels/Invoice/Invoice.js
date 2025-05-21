const mongoose = require("mongoose");
const moment = require("moment");

const AutoIncrement = require("mongoose-sequence")(mongoose);

const InvoiceSchema = mongoose.Schema(
  {
    Invoice_Id: {
      type: Number,
      trim: true,
      unique: true,
    },
    Company_Id: {
      type: Number,
    },
    clientId: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    isPaid: {
      type: String,
      enum: ["PAID", "UNPAID", "PARTIALLY_PAID"],
      default: "UNPAID",
    },
    rate: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    term: {
      type: String,
      required: true,
      maxlength: 30,
    },
    createdDate: {
      type: String,
      default: moment().format("DD/MM/YYYY"),
    },
  },
  {
    timestamps: true,
  }
);

InvoiceSchema.plugin(AutoIncrement, {
  inc_field: "Invoice_Id",
  start_seq: 1,
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = Invoice;
