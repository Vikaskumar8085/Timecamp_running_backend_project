const asynchandler = require("express-async-handler");
const Company = require("../../models/Othermodels/Companymodels/Company");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const path = require("path");

const companyCtr = {
  // create company
  create_company: asynchandler(async (req, res) => {
    try {
      // user authentication
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please login first");
      }

      let attachmentPath = req.file ? req.file.filename : Company_Logo;
      let uploadPath = "uploads/";

      // Get file extension
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      console.log(fileExt, "reqogsdfisdfl");

      // Define subfolders based on file type
      if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
        uploadPath += "documents/";
      } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)) {
        uploadPath += "images/";
      } else if (file.mimetype === "text/csv") {
        uploadPath += "csv/";
      } else {
        uploadPath += "others/"; // Fallback folder
      }

      console.log(uploadPath, "upload path");

      const companylogo = attachmentPath
        ? `${req.protocol}://${req.get("host")}/${uploadPath}/${attachmentPath}`
        : null;

      const response = await Company({
        Company_Name: req.body.Company_Name,
        Company_Email: req.body.Company_Email,
        Address: req.body.Address,
        Postal_Code: req.body.Postal_Code,
        Phone: req.body.Phone,
        Company_Logo: companylogo,
        Employee_No: req.body.Employee_No,
        Established_date: req.body.Established_date,
        CompanyWesite: req.body.CompanyWesite,
        Tex_Number: req.body.Tex_Number,
        UserId: user?.user_id,
      });
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      } else {
        await response.save();
      }
      return res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: "company created successfully",
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch company
  fetch_company: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please login first");
      }
      const response = await Company.findOne({UserId: user.user_id});
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      }

      const companylogo = response.Company_Logo
        ? `${req.protocol}://${req.get("host")}/${response.Company_Logo}`
        : null;
      // console.log(`${req.protocol}://${req.get("host")}/${company.Company_Logo)
      console.log(response._doc, "//////////////");
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  editcompany: asynchandler(async (req, res) => {
    try {
      const {id} = req.params;
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please login first");
      }
      const company = await Company.findOne({UserId: user.user_id});
      if (!company) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      }
      if (company.UserId.toString() !== user.user_id.toString()) {
        return res.status(HttpStatusCodes.FORBIDDEN).json({
          message: "You are not authorized to edit this company",
        });
      }

      // Update fields only if provided
      const updatedCompany = await Company.findOneAndUpdate(
        {Company_Id: parseInt(id)},
        {
          $set: {
            Company_Name: req.body.Company_Name || company.Company_Name,
            Company_Email: req.body.Company_Email || company.Company_Email,
            Address: req.body.Address || company.Address,
            Postal_Code: req.body.Postal_Code || company.Postal_Code,
            Phone: req.body.Phone || company.Phone,
            Company_Logo: req.body.Company_Logo || company.Company_Logo,
            Employee_No: req.body.Employee_No || company.Employee_No,
            Established_date:
              req.body.Established_date || company.Established_date,
            CompanyWesite: req.body.CompanyWesite || company.CompanyWesite,
            Tex_Number: req.body.Tex_Number || company.Tex_Number,
          },
        },
        {new: true, runValidators: true} // Return the updated document
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Company updated successfully",
        result: updatedCompany,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = companyCtr;
