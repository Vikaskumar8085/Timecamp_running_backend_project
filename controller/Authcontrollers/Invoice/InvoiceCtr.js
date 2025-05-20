const asyncHandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");
const Invoice = require("../../../models/Othermodels/Invoice/Invoice");

const InvoiceCtr = {
  createInvoice: asyncHandler(async (req, res) => {
    try {
      const { startData, EndData } = req.body;
      console.log(req.body);

      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkcompany = await Company?.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const findTimesheetdata = await TimeSheet.findOne({
        start_time: { $gte: new Date(startData) },
        end_time: { $lte: new Date(EndData) },
      });

      if (!findTimesheetdata) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Timesheet Not found");
      }

      const response = await Invoice({
        ...req.body,
        Company_Id: checkcompany.Company_Id,
      });
      if (response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Invoice Not Found");
      } else {
        await response.save();
      }

      return res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: "Invoice created successfylly",
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchInvoice: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkcompany = await Company?.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      const response = await Invoice.find({
        Company_Id: checkcompany.Company_Id,
      }).lean();
      if (response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Invoice Not found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, result: response });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  InvoicePayment: asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkcompany = await Company?.findOne({ UserId: user?.user_id });
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      const response = await Invoice.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true }
      );
      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Invoice Not found");
      }
      return res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: "Invoice updated successfully" });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = InvoiceCtr;
