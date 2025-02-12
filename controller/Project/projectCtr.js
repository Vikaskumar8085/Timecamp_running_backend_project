const asyncHandler = require("express-async-handler");
const User = require("../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Company = require("../../models/Othermodels/Companymodels/Company");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const moment = require("moment");
const fs = require("fs");
const csvParser = require("csv-parser");
const Role = require("../../models/MasterModels/Roles/Roles");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const generateProjectCode = async () => {
  const lastProject = await Project.findOne().sort({ProjectId: -1});
  const lastId = lastProject ? lastProject.ProjectId : 0;
  const newProjectId = lastId + 1;
  return `P${newProjectId.toString().padStart(3, "0")}`;
};

const projectCtr = {
  // create_Project: asyncHandler(async (req, res) => {
  //   try {
  //     const {
  //       Project_Name,
  //       Start_Date,
  //       End_Date,
  //       clientId,
  //       Project_Type,
  //       Project_Hours,
  //       Project_Status,
  //       RoleResource,
  //       Project_ManagersId,
  //     } = req.body;

  //     // check user
  //     const user = await User.findById(req.user);
  //     if (!user) {
  //       res.status(HttpStatusCodes.UNAUTHORIZED);
  //       throw new Error("Un Authorized User");
  //     }

  //     // check company

  //     const company = await Company?.findOne({UserId: user?.user_id});
  //     if (!company) {
  //       res.status(HttpStatusCodes?.BAD_REQUEST);
  //       throw new Error("company not exists please create first company");
  //     }
  //     console.log(company, "comapny data");

  //     const formattedStartDate = Start_Date
  //       ? moment(Start_Date, "DD/MM/YYYY").format("DD/MM/YYYY")
  //       : moment().format("DD/MM/YYYY");
  //     const formattedEndDate = End_Date
  //       ? moment(End_Date, "DD/MM/YYYY").format("DD/MM/YYYY")
  //       : moment().format("DD/MM/YYYY");

  //     if (
  //       !moment(formattedStartDate, "DD/MM/YYYY", true).isValid() ||
  //       !moment(formattedEndDate, "DD/MM/YYYY", true).isValid()
  //     ) {
  //       res.status(HttpStatusCodes.NOT_FOUND);
  //       throw new Error({message: "Invalid date format. Use DD/MM/YYYY."});
  //     }

  //     const response = await Project({
  //       CompanyId: company?.Company_Id,
  //       Project_Name,
  //       Start_Date,
  //       End_Date,
  //       clientId,
  //       Project_Type,
  //       Project_Hours,
  //       Project_Status,
  //       RoleResource,
  //       Project_ManagersId,
  //     });

  //     await response.save();

  //     return res.status(HttpStatusCodes.CREATED).json({
  //       message: "project created successfully",
  //       result: response,
  //       success: true,
  //     });
  //   } catch (error) {
  //     throw new Error(error?.message);
  //   }
  // }),

  addProject: asyncHandler(async (req, res) => {
    try {
      const {
        Project_Name,
        clientId,
        Project_Type,
        Project_Hours,
        Project_ManagersId,
        RoleResource,
        Start_Date,
        End_Date,
      } = req.body;

      const Project_Code = await generateProjectCode();
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      const newProject = await Project({
        CompanyId: company.Company_Id,
        Project_Name,
        Project_Code: parseInt(Project_Code.substring(1)),
        clientId,
        Project_Type,
        Project_Hours,
        Project_ManagersId,
        RoleResource,
        Start_Date: Start_Date || moment().format("DD/MM/YYYY"),
        End_Date: End_Date || moment().format("DD/MM/YYYY"),
      });


      

      await newProject.save();
      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: newProject,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // bulk upload project
  // bulkupload_projects: asyncHandler(async (req, res) => {
  //   try {
  //     try {
  //       if (!req.file) {
  //         return res.status(400).json({ success: false, message: "No file uploaded." });
  //       }

  //       const filePath = req.file.path;
  //       const projects = [];
  //       const errors = [];

  //       let lastProject = await Project.findOne().sort({ ProjectId: -1 });
  //       let lastId = lastProject ? lastProject.ProjectId : 0;

  //       // Read CSV file
  //       fs.createReadStream(filePath)
  //         .pipe(csvParser())
  //         .on("data", async (row) => {
  //           const existingProject = await Project.findOne({
  //             $or: [{ Project_Name: row.Project_Name }, { Project_Code: row.Project_Code }],
  //           });

  //           if (existingProject) {
  //             errors.push({
  //               row: row,
  //               message: `Duplicate Project: ${row.Project_Name} or Code: ${row.Project_Code} already exists.`,
  //             });
  //           } else {
  //             lastId++;
  //             const projectCode = `P${lastId.toString().padStart(3, "0")}`;

  //             projects.push({
  //               CompanyId: parseInt(row.CompanyId),
  //               ProjectId: lastId,
  //               Project_Name: row.Project_Name,
  //               Project_Code: projectCode,
  //               Start_Date: row.Start_Date || moment().format("DD/MM/YYYY"),
  //               End_Date: row.End_Date || moment().format("DD/MM/YYYY"),
  //               clientId: parseInt(row.clientId),
  //               Client_Email: row.Client_Email || "",
  //               Project_Type: row.Project_Type || "",
  //               Project_Hours: row.Project_Hours || "",
  //               Project_Status: row.Project_Status || "InActive",
  //               RoleResource: row.RoleResource ? JSON.parse(row.RoleResource) : [],
  //               ResourseEmail: row.ResourseEmail || "",
  //               Project_ManagersId: parseInt(row.Project_ManagersId),
  //             });
  //           }
  //         })
  //         .on("end", async () => {
  //           try {
  //             if (projects.length > 0) {
  //               await Project.insertMany(projects);
  //             }

  //             fs.unlinkSync(filePath); // Delete file after processing

  //             if (errors.length > 0) {
  //               return res.status(400).json({
  //                 success: false,
  //                 message: "Some projects were not uploaded due to duplicates.",
  //                 errors,
  //               });
  //             }

  //             res.status(201).json({ success: true, message: "CSV uploaded successfully", data: projects });
  //           } catch (error) {
  //             res.status(500).json({ success: false, message: "Error inserting projects", error: error.message });
  //           }
  //         });
  //   } catch (error) {
  //     throw new Error(error?.message);
  //   }
  // }),

  // fetch projects

  fetch_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {
        CompanyId: company.Company_Id,
      };

      const response = await Project.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      // const projectiddata = await getproject.map((item) => {
      //   return item.RoleResource?.map((item) => item?.RRId);
      // });
      // let bdata = projectiddata.join(",").split(" ");

      // const findRole = await Role.find({
      //   RoleId: bdata?.map((item) => parseInt(item)),
      // });
      // console.log(findRole, "dafsad");

      // const Roledata = await findRole.map((item) => item?.RoleName);

      // const ProjectData = {
      //   RoleName: Roledata,
      // };
      return res.status(HttpStatusCodes.OK).json({
        message: "fetch projects successfully",
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetch_active_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        CompanyId: company?.Company_Id,
        Project_Status: "Active",
      };
      const response = await Project.find(queryObj).lean().exec();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        message: "fetch project successfully",
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetch_inactive_projects: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        CompanyId: company?.Company_Id,
        Project_Status: "InActive",
      };
      const response = await Project.find(queryObj).lean().exec();

      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("Bad Request");
      }
      return res.status(HttpStatusCodes.OK).json({
        message: "fetch project successfully",
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //
  fetchstaffmembers: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User");
      }

      // check company
      const company = await Company?.findOne({UserId: user?.user_id});
      if (!company) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {
        CompanyId: company.Company_Id,
      };
      const response = await StaffMember.find(queryObj).lean().exec();
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      }
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = projectCtr;
