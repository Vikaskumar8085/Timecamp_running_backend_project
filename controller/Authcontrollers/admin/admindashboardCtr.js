const asynchandler = require("express-async-handler");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const Client = require("../../../models/AuthModels/Client/Client");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");

const admindashboardCtr = {
  fetchtotalCounter: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      // staff count
      const staffcount = await StaffMember.find({
        CompanyId: checkcompany.Company_Id,
      });

      //   client count
      const clientcount = await Client.find({
        Common_Id: checkcompany.Company_Id,
      });
      const projectcount = await Project.find({
        CompanyId: checkcompany.Company_Id,
      });
      const approvedTimesheets = await TimeSheet.find({
        CompanyId: checkcompany.Company_Id,
        approval_status: "APPROVED",
      });

      const totalHours = approvedTimesheets.reduce(
        (sum, entry) => sum + (parseInt(entry.hours) || 0),
        0
      );

      console.log("Total Approved Work Hours:", totalHours);

      const resp = {
        projectNo: projectcount.length,
        clientNo: clientcount.length,
        staffNo: staffcount.length,
        totalHours: totalHours,
      };

      return res.status(HttpStatusCodes.OK).json({success: true, result: resp});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  fetchrecentproject: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }

      let queryObj = {};
      queryObj = {
        CompanyId: checkcompany?.Company_Id,
      };
      const response = await Project.find(queryObj)
        .sort({createdAt: -1})
        .limit(5)
        ?.select("Project_Name Start_Date End_Date");

      if (!response) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Recent Project Not Found");
      }

      return res.status(HttpStatusCodes.OK).json({
        result: response,
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // billed and notbilled hours
  fetchbilledandnotbilledhours: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User. Please Sign Up."});
      }

      const checkCompany = await Company.findOne({UserId: user?.user_id});
      if (!checkCompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company does not exist. Please create a company first.",
        });
      }

      // Fetch all billed and not billed timesheets for the company
      const billedTimesheets = await TimeSheet.find({
        CompanyId: checkCompany?.Company_Id,
        billing_status: "BILLED",
      });

      const notBilledTimesheets = await TimeSheet.find({
        CompanyId: checkCompany?.Company_Id,
        billing_status: "NOT_BILLED",
      });

      if (!billedTimesheets.length && !notBilledTimesheets.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "No timesheets found."});
      }
      console.log(billedTimesheets.length, notBilledTimesheets.length);
      const projectIds = [
        ...new Set(
          [...billedTimesheets, ...notBilledTimesheets].map((ts) => ts.project)
        ),
      ];
      const projects = await Project.find({ProjectId: {$in: projectIds}});

      if (!projects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Projects not found."});
      }

      // Construct response
      const result = projects.map((project) => {
        const billedCount = billedTimesheets.filter(
          (ts) => ts.project.toString() === project.ProjectId.toString()
        ).length;
        const notBilledCount = notBilledTimesheets.filter(
          (ts) => ts.project.toString() === project.ProjectId.toString()
        ).length;

        return {
          Project_Name: project?.Project_Name,
          BILLED: billedCount,
          NOT_BILLED: notBilledCount,
        };
      });

      console.log(result, "Result result");
      res.status(200).json({success: true, data: result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // hourby projects
  fetchHoursbyproject: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User. Please Sign Up."});
      }

      const checkCompany = await Company.findOne({UserId: user?.user_id});
      if (!checkCompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company does not exist. Please create a company first.",
        });
      }

      const checkprojects = await Project.find({
        CompanyId: checkCompany?.Company_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }

      // Extract all project IDs
      const projectIds = checkprojects.map((proj) => proj.ProjectId);

      // Find all timesheets for the projects
      const findtimesheets = await TimeSheet.find({project: {$in: projectIds}});

      if (!findtimesheets.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Timesheet not found"});
      }

      // Calculate total billed hours
      const totalBilledHours = findtimesheets.reduce(
        (sum, entry) => sum + (entry.billed_hours || 0),
        0
      );

      return res.status(HttpStatusCodes.OK).json({
        Projects: checkprojects.map((proj) => ({
          ProjectName: proj.Project_Name,
          totalBilledHours,
        })),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //day by total hour
  fetchdaybytotalhours: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User. Please Sign Up."});
      }

      const checkCompany = await Company.findOne({UserId: user?.user_id});
      if (!checkCompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company does not exist. Please create a company first.",
        });
      }

      const findtimesheet = await TimeSheet.find({
        CompanyId: checkCompany?.Company_Id,
      });
      if (!findtimesheet) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("timesheet not found");
      }
      if (!findtimesheet.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Timesheet not found"});
      }

      // Calculate total hours per day
      const dayWiseHours = findtimesheet.reduce((acc, entry) => {
        const day = entry.date; // Assuming `date` field stores day-wise data
        acc[day] = (acc[day] || 0) + (entry.hours || 0);
        return acc;
      }, {});

      return res.status(HttpStatusCodes.OK).json({
        totalhours: Object.values(dayWiseHours),
        days: Object.keys(dayWiseHours),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // hours by company
  fetchhoursbycompany: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User. Please Sign Up."});
      }

      const checkCompany = await Company.findOne({UserId: user?.user_id});
      if (!checkCompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company does not exist. Please create a company first.",
        });
      }
      const findtimesheet = await TimeSheet.find({
        CompanyId: checkCompany?.Company_Id,
      });
      const totalOkHours = findtimesheet.reduce(
        (sum, entry) => sum + (entry.ok_hours || 0),
        0
      );
      const totalBilledHours = findtimesheet.reduce(
        (sum, entry) => sum + (entry.billed_hours || 0),
        0
      );
      const totalBlankHours = findtimesheet.reduce(
        (sum, entry) => sum + (entry.blank_hours || 0),
        0
      );
      const totalhours = findtimesheet.reduce(
        (sum, entry) => sum + (Number(entry.hours) || 0),
        0
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        companyId: checkCompany.Company_Id,
        totalOkHours,
        totalBilledHours,
        totalBlankHours,
        totalhours,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch

  fetchprojectecttimeutilize: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User. Please Sign Up."});
      }

      const checkCompany = await Company.findOne({UserId: user?.user_id});
      if (!checkCompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company does not exist. Please create a company first.",
        });
      }

      const checkprojects = await Project.find({
        CompanyId: checkCompany?.Company_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }

      // Extract all project IDs
      const projectIds = checkprojects.map((proj) => proj.ProjectId);

      // Find all timesheets for the projects
      const findtimesheets = await TimeSheet.find({project: {$in: projectIds}});

      if (!findtimesheets.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Timesheet not found"});
      }

      // Calculate total billed hours
      const totalBilledHours = findtimesheets.reduce(
        (sum, entry) => sum + (entry.billed_hours || 0),
        0
      );
      const totalOkhours = findtimesheets.reduce(
        (sum, entry) => sum + (entry.ok_hours || 0),
        0
      );

      const totalblankhours = findtimesheets.reduce(
        (sum, entry) => sum + (entry.blank_hours || 0),
        0
      );
      return res.status(HttpStatusCodes.OK).json({
        Projects: checkprojects.map((proj) => ({
          ProjectName: proj.Project_Name,
          totalBilledHours,
          totalOkhours,
          totalblankhours,
        })),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch approvel by billled hours and total hours
  fetchapprovelbybilledhours: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User. Please Sign Up."});
      }

      const checkCompany = await Company.findOne({UserId: user?.user_id});
      if (!checkCompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Company does not exist. Please create a company first.",
        });
      }

      const findtimesheet = await TimeSheet.find({
        CompanyId: checkCompany?.Company_Id,
      });
      if (!findtimesheet || !findtimesheet.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Timesheet not found"});
      }

      // Calculate total hours and billed hours per day
      const dayWiseData = findtimesheet.reduce((acc, entry) => {
        const day = entry.day; // Assuming `date` field stores day-wise data
        acc[day] = acc[day] || {total_hours: 0, billed_hours: 0};
        acc[day].total_hours += Number(entry.hours) || 0;
        acc[day].billed_hours += Number(entry.billed_hours) || 0; // Assuming `billed_hours` field exists
        return acc;
      }, {});

      return res.status(HttpStatusCodes.OK).json({
        total_hours: Object.values(dayWiseData).map((d) => d.total_hours),
        billed_hours: Object.values(dayWiseData).map((d) => d.billed_hours),
        days: Object.keys(dayWiseData),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = admindashboardCtr;
