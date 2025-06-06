const asynchandler = require("express-async-handler");
const Company = require("../../models/Othermodels/Companymodels/Company");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const User = require("../../models/AuthModels/User/User");
const Notification = require("../../models/Othermodels/Notification/Notification");
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
        Person_Name: req.body.Person_Name,
        Person_Email: req.body.Person_Email,
        Person_Phones: req.body.Person_Phones,
        UserId: user?.user_id,
      });
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      } else {
        await response.save();

        await Notification({
          SenderId: user?.user_id,
          ReciverId: user.user_id,
          Name: user?.Role.concat(" ", user?.FirstName),
          Pic: user?.Photo,
          Description: `Dear ${user?.FirstName}, your company has been successfully created. Welcome aboard!`,
        }).save();
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
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please login first");
      }
      const ischecked = await Company.findOne({UserId: user.user_id});
      if (!ischecked) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      }

      console.log(req.body, "data");

      let attachmentPath = req.file ? req.file.filename : null;
      let uploadPath = "uploads/";

      if (req.file) {
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
          uploadPath += "documents/";
        } else if (
          [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)
        ) {
          uploadPath += "images/";
        } else if (req.file.mimetype === "text/csv") {
          uploadPath += "csv/";
        } else {
          uploadPath += "others/";
        }
      }

      const companyLogo = attachmentPath
        ? `${req.protocol}://${req.get("host")}/${uploadPath}/${attachmentPath}`
        : null; // Keep existing if no new file

      console.log(companyLogo, "companyLogo");
      const {Person_Email, Person_Name, Person_Phones, ...rest} = req.body;

      const updatedCompany = await Company.findOneAndUpdate(
        {Company_Id: parseInt(req.params.id)},
        {
          $set: {
            Company_Logo: companyLogo,
            ...rest, // only includes fields not explicitly excluded above
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedCompany) {
        return res
          .status(404)
          .json({success: false, message: "Company not found"});
      }

      await Notification({
        SenderId: user?.user_id,
        ReciverId: user.user_id,
        Name: user?.Role.concat(" ", user?.FirstName),
        Pic: user?.Photo,
        Description: `Dear ${user?.FirstName}, your company details have been successfully updated.`,
      }).save();

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
