const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const Client = require("../../../models/AuthModels/Client/Client");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const xlsx = require("xlsx");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const Task = require("../../../models/Othermodels/Task/Task");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");
const csvuploadCtr = {
  generateClientCsvFile: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const schemaFields = Object.keys(Client.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "Common_Id" &&
          field !== "_V" &&
          field !== "Role" &&
          field !== "Client_Id" &&
          field !== "Password" &&
          field !== "Client_Status" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "schema_fields.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "schema_fields.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  generateEmployeecsv: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const schemaFields = Object.keys(StaffMember.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "CompanyId" &&
          field !== "_V" &&
          field !== "staff_Id" &&
          field !== "IsActive" &&
          field !== "Password" &&
          field !== "Role" &&
          field !== "SubRole" &&
          field !== "SubRole" &&
          field !== "Manager" &&
          field !== "Manager.ManagerId" &&
          field !== "Manager.Manager_Name" &&
          field !== "Permission" &&
          field !== "Designation" &&
          field !== "Contractor_Company" &&
          field !== "Hourly_Rate" &&
          field !== "Supervisor" &&
          field !== "Backlog_Entries" &&
          field !== "Photos" &&
          field !== "Password" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "Employee.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "Employee.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   generate contractor csv
  generateContractorcsv: asyncHandler(async (req, res) => {
    try {
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const schemaFields = Object.keys(StaffMember.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "CompanyId" &&
          field !== "_V" &&
          field !== "staff_Id" &&
          field !== "IsActive" &&
          field !== "Password" &&
          field !== "Role" &&
          field !== "SubRole" &&
          field !== "SubRole" &&
          field !== "Manager" &&
          field !== "Manager.ManagerId" &&
          field !== "Manager.Manager_Name" &&
          field !== "Permission" &&
          field !== "Backlog_Entries" &&
          field !== "Designation" &&
          field !== "Contractor_Company" &&
          field !== "Hourly_Rate" &&
          field !== "Supervisor" &&
          field !== "Photos" &&
          field !== "Password" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "contractor.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "contractor.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   generate Project csv
  generateProjectcsv: asyncHandler(async (req, res) => {
    try {
      // const checkemployee = await

      const schemaFields = Object.keys(Project.schema.paths)
        .filter(
          (field) =>
            field !== "_id" &&
            field !== "Common_Id" &&
            field !== "_V" &&
            field !== "Role" &&
            field !== "Client_Id" &&
            field !== "Password" &&
            field !== "__v" &&
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "CompanyId" &&
            field !== "ProjectId" &&
            field !== "clientId" &&
            field !== "Project_ManagersId"
        )
        .concat("Customer_Email", "Project_Manager_Email", "Resource_Email");
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "schema_fields.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "schema_fields.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // generate Task csv
  generateTaskcsv: asyncHandler(async (req, res) => {
    try {
      // const checkemployee = await

      const schemaFields = Object.keys(Task.schema.paths).filter(
        (field) =>
          field !== "_id" &&
          field !== "Common_Id" &&
          field !== "_V" &&
          field !== "Role" &&
          field !== "Client_Id" &&
          field !== "Password" &&
          field !== "__v" &&
          field !== "createdAt" &&
          field !== "updatedAt"
      );
      // console.log(schemaFields)
      // Convert to CSV format
      const csvContent = schemaFields.join(",") + "\n";
      // Define file path
      const filePath = path.join(__dirname, "schema_fields.csv");

      // Write CSV file
      fs.writeFileSync(filePath, csvContent, "utf8");

      //   res.download(filePath)
      //   console.log(`CSV file created: ${filePath}`);
      //   const filePath = path.join(__dirname, "schema_fields.csv");
      res.download(filePath, "schema_fields.csv", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   Timesheet csv
  generateTimesheetcsv: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  uploadclientcsv: asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({error: "No file uploaded."});
      }
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const checkCompany = await Company?.findOne({UserId: user?.user_id});
      if (!checkCompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const insertdata = [];

      for await (let newdata of data) {
        const clientdata = await Client({
          Common_Id: checkCompany.Company_Id,
          ...newdata,
        });
        const saveclient = await clientdata.save();
        insertdata.push(saveclient);
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: insertdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  uploadcontractorcsv: asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({error: "No file uploaded."});
      }
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const insertdata = [];

      for await (let newdata of data) {
        const contractordata = await StaffMember({
          CompanyId: company.Company_Id,
          Role: "Contractor",
          ...newdata,
        });
        const savecontractor = await contractordata.save();
        insertdata.push(savecontractor);
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: insertdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  uploademployeecsv: asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({error: "No file uploaded."});
      }
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const insertdata = [];

      for await (let newdata of data) {
        const employeedata = await StaffMember({
          CompanyId: company.Company_Id,
          Role: "Employee",
          ...newdata,
        });
        const saveemploye = await employeedata.save();
        insertdata.push(saveemploye);
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: insertdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  uploadTaskcsv: asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({error: "No file uploaded."});
      }
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const insertdata = [];

      for await (let newdata of data) {
        const taskdata = await Task({
          CompanyId: company.Company_Id,
          ...newdata,
        });
        const savetask = await taskdata.save();
        insertdata.push(savetask);
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: insertdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  uploadprojectCsv: asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({error: "No file uploaded."});
      }
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const insertdata = [];

      for await (let newdata of data) {
        const client = await Client.findOne({
          Client_Email: newdata.Customer_Email,
        });
        if (!client) {
          return res.status(400).json({
            error: `Client with email ${newdata.Client_Email} not found`,
          });
        }

        //
        // 📌 Step 2: Validate Project Manager (Staff Member)
        const staffMember = await StaffMember.findOne({
          Email: newdata.Resource_Email,
        });
        if (!staffMember) {
          return res.status(400).json({
            error: `Project Manager ID ${row.Project_ManagersId} does not exist in StaffMemberSchema`,
          });
        }

        // // 📌 Step 3: Validate ResourseEmail and Find Corresponding staff_id
        const resourceStaff = await StaffMember.findOne({
          Email: row.Project_Manager_Email,
        });
        if (!resourceStaff) {
          return res.status(400).json({
            error: `ResourseEmail ${newdata.ResourseEmail} not found in StaffMemberSchema`,
          });
        }

        // // 📌 Step 4: Validate Role Resources and Store RRId as staff_id
        // let parsedRoleResources = [];
        // try {
        //   parsedRoleResources = JSON.parse(row.roleResources || "[]");
        // } catch (error) {
        //   return res.status(400).json({ error: "Invalid roleResources format" });
        // }

        // let validRoles = [];
        // for (const role of parsedRoleResources) {
        //   const roleExists = await RoleResource.findOne({ RRId: resourceStaff.staff_id, RId: role.RId });
        //   if (!roleExists) {
        //     await RoleResource.create({ RRId: resourceStaff.staff_id, RId: role.RId });
        //   }
        //   validRoles.push({ RRId: resourceStaff.staff_id, RId: role.RId });
        // }
        //

        const projectdata = await Project({
          CompanyId: company.Company_Id,
          clientId: client.Client_Id,
          ...newdata,
        });
        const saveproject = await projectdata.save();
        insertdata.push(saveproject);
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: insertdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  uploadTimesheetCsv: asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({error: "No file uploaded."});
      }
      const user = await User?.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      // chcek companys
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const insertdata = [];

      for await (let newdata of data) {
        const findstaffmember = await StaffMember.findOne({
          Email: newdata.Resource_Email,
        });

        if (!findstaffmember) {
          res.status(HttpStatusCodes.NOT_FOUND);
          throw new Error(
            `Resource_Email ${newdata.Resource_Email} not found in StaffMember`
          );
          continue;
        }

        const findproject = await Project.findOne({
          Project_Code: newdata.Project_Code,
        });

        if (!findproject) {
          res.status(HttpStatusCodes.NOT_FOUND);
          throw new Error(
            `Project_Code ${newdata.Project_Code} not found in Project.`
          );

          continue;
        }

        const timesheetdata = await TimeSheet({
          CompanyId: company.Company_Id,
          Staff_Id: findstaffmember.staff_Id,
          project: findproject.ProjectId,
          ...newdata,
        });
        const savetimesheet = await timesheetdata.save();
        insertdata.push(savetimesheet);
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: insertdata,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = csvuploadCtr;
