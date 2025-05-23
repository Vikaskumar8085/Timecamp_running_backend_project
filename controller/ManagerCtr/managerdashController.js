const asyncHandler = require("express-async-handler");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const Company = require("../../models/Othermodels/Companymodels/Company");
const moment = require("moment");
const Task = require("../../models/Othermodels/Task/Task");
const managerdashctr = {
  dashboardcounter: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      // staff count
      const staffcount = await StaffMember.find({
        ManagerId: user.staff_Id,
      });
      // project count
      const countproject = await Project.find({
        createdBy: user?.staff_Id,
      });

      //   //   client count
      //   const clientcount = await Client.find({
      //     Common_Id: checkcompany.Company_Id,
      //   });
      //   const projectcount = await Project.find({
      //     createdBy: user?.staff_Id,
      //   });
      let projectids = await countproject.map((proj) => proj.ProjectId);
      const approvedTimesheets = await TimeSheet.find({
        project: {$in: projectids},
        approval_status: "APPROVED",
      });

      const totalHours = approvedTimesheets.reduce(
        (sum, entry) => sum + (parseInt(entry.hours) || 0),
        0
      );

      const totalTask = await TimeSheet.find({project: {$in: projectids}});
      //   console.log("Total Approved Work Hours:", totalHours);

      // const
      const resp = {
        projectNo: countproject.length,
        totalTask: totalTask.length,
        staffNo: staffcount.length,
        totalHours: totalHours,
      };

      return res.status(HttpStatusCodes.OK).json({success: true, result: resp});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  managerdashproductivityleaderboard: asyncHandler(async (req, res) => {
    try {
      // staff member
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const staffMembers = await StaffMember.find({
        ManagerId: user.staff_Id,
      });

      if (!staffMembers.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No staff members found.");
      }

      const staffIds = staffMembers.map((staff) => staff.staff_Id);

      // Fetch timesheets for all staff members
      const timesheets = await TimeSheet.find({Staff_Id: {$in: staffIds}});

      if (!timesheets.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No timesheet data found.");
      }

      // Calculate productivity percentages for each staff member
      const leaderboard = staffMembers.map((staff) => {
        const staffTimesheets = timesheets.filter(
          (t) => t.Staff_Id === staff.staff_Id
        );

        const totalHours = staffTimesheets.reduce(
          (sum, t) => sum + (t.hours || 0),
          0
        );
        const billedHours = staffTimesheets.reduce(
          (sum, t) => sum + (t.billed_hours || 0),
          0
        );

        const percentage =
          totalHours > 0 ? Math.ceil((billedHours / totalHours) * 100) : 0;

        return {
          Name: `${staff.FirstName} ${staff.LastName}`,
          percentage,
        };
      });

      // Sort leaderboard by percentage in descending order and get the top 5
      const top5 = leaderboard
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: top5,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  managerdashRecentproject: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   manager dash total hour by project
  managerdashtotalhourbyresources: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const fetchstaff = await StaffMember.find({ManagerId: user?.staff_Id});
      if (!fetchstaff || fetchstaff.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Manager Team Not Found");
      }
      const staffIds = fetchstaff?.map((staff) => {
        return staff.staff_Id;
      });

      const staffTimesheets = await TimeSheet.find({Staff_Id: staffIds});
      console.log(staffTimesheets);
      if (!staffTimesheets || staffTimesheets.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("staff Not founds");
      }

      const result = {
        StaffName: fetchstaff.map((staff) => staff.FirstName),
        totalBilledHours: staffTimesheets.map((sheet) => sheet.billed_hours),
        totalHours: staffTimesheets.map((sheet) => sheet.hours),
      };

      return res.status(HttpStatusCodes.OK).json({success: true, result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //    manager total hour by project
  managerdashtotalhoursbyproject: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        createdBy: user?.staff_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      console.log(checkprojects, "proejcts");
      // Extract all project IDs
      const projectIds = checkprojects.map((proj) => proj.ProjectId);

      // Find all timesheets for the projects
      const findtimesheets = await TimeSheet.find({
        project: {$in: projectIds},
      });

      if (!findtimesheets.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Timesheet not found"});
      }

      // Calculate total billed hours
      const totalBilledHours = findtimesheets.reduce(
        (sum, entry) => sum + (Number(entry.billed_hours) || 0),
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
  //   manager hours by company
  managerdashhoursbycompany: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        createdBy: user?.staff_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      console.log(checkprojects, "proejcts");
      // Extract all project IDs
      const projectIds = checkprojects.map((proj) => proj.ProjectId);

      // Find all timesheets for the projects
      const findtimesheet = await TimeSheet.find({
        project: {$in: projectIds},
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
        totalOkHours,
        totalBilledHours,
        totalBlankHours,
        totalhours,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   manager billing  status distribution
  managerdashbillingstatusdistribution: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        createdBy: user?.staff_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      let projectids = await checkprojects.map((proj) => proj.ProjectId);
      console.log(projectids, "<L>projectids");
      // Fetch all billed and not billed timesheets for the company
      const billedTimesheets = await TimeSheet.find({
        project: {$in: projectids},
        billing_status: "BILLED",
      });

      const notBilledTimesheets = await TimeSheet.find({
        project: {$in: projectids},
        billing_status: "NOT_BILLED",
      });

      if (!billedTimesheets.length && !notBilledTimesheets.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "No timesheets found."});
      }
      console.log(billedTimesheets.length, notBilledTimesheets.length);
      // const projectIds = [
      //   ...new Set(
      //     [...billedTimesheets, ...notBilledTimesheets].map((ts) => ts.project)
      //   ),
      // ];
      // console.log(projectIds, "projectdata");
      // const projects = await Project.find({ProjectId: {$in: projectIds}});

      // if (!projects.length) {
      //   return res
      //     .status(HttpStatusCodes.NOT_FOUND)
      //     .json({message: "Projects not found."});
      // }

      // Construct response
      // const result = projects.map((project) => {
      //   const billedCount = billedTimesheets.filter(
      //     (ts) => ts.project.toString() === project.ProjectId.toString()
      //   ).length;
      //   const notBilledCount = notBilledTimesheets.filter(
      //     (ts) => ts.project.toString() === project.ProjectId.toString()
      //   ).length;

      //   return {
      //     Project_Name: project?.Project_Name,
      //     BILLED: billedCount,
      //     NOT_BILLED: notBilledCount,
      //   };
      // });

      const result = {
        BILLED: billedTimesheets.length,
        NOT_BILLED: notBilledTimesheets.length,
      };

      res.status(200).json({success: true, data: result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // manager daily hours
  managerdashdailyhours: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        createdBy: user?.staff_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      let projectids = await checkprojects.map((proj) => proj.ProjectId);
      const findtimesheet = await TimeSheet.find({
        project: {$in: projectids},
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

      const dayWiseHours = findtimesheet.reduce((acc, entry) => {
        const day = entry.day; // Assuming `date` field stores day-wise data
        acc[day] = (acc[day] || 0) + (Number(entry.hours) || 0);
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
  //   manager approvel  and billing over time
  managerdashapprovelandbillingovertime: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        createdBy: user?.staff_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      let projectids = await checkprojects.map((proj) => proj.ProjectId);

      const findtimesheet = await TimeSheet.find({
        project: {$in: projectids},
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
  //   manager project time utilization
  managerdashprojecttimeutilization: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        createdBy: user?.staff_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      let projectids = await checkprojects.map((proj) => proj.ProjectId);

      // Find all timesheets for the projects
      const findtimesheets = await TimeSheet.find({
        project: {$in: projectids},
      });

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

  managerprojectLeaderboard: asyncHandler(async (req, res) => {
    try {
      // Check if user exists
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup",
        });
      }
      // check if the compnay exists

      const staffMembers = await StaffMember.find({
        ManagerId: user.staff_Id,
      });

      if (!staffMembers.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No staff members found.");
      }

      const findRolesResource = await RoleResource.find({
        RRId: {$in: staffMembers.map((staff) => staff.staff_Id)},
      });

      const fetchProject = await Project.find({
        CompanyId: {$in: findRolesResource?.map((item) => item.ProjectId)},
      });

      const response = await Promise.all(
        fetchProject.map(async (item) => {
          const resources = await RoleResource.find({
            ProjectId: item?.ProjectId,
          });

          const rrids = resources.map((res) => res.RRId);
          const staffMembers = await StaffMember.find({
            staff_Id: {$in: rrids},
          });

          const findtimesheets = await TimeSheet.find({
            Staff_Id: {$in: rrids},
          });

          // Sum TotalHours and BilledHours
          let totalHours = 0;
          let billedHours = 0;

          findtimesheets.forEach((sheet) => {
            totalHours += sheet.hours || 0;
            billedHours += sheet.billed_hours || 0;
          });

          // Calculate efficiency
          let efficiency = 0;
          if (billedHours > 0) {
            efficiency = (totalHours / billedHours) * 100;
          }

          // Calculate percentage per staff
          const percentage =
            staffMembers.length > 0
              ? (efficiency / staffMembers.length).toFixed(2)
              : "0.00";

          return {
            ProjectName: item?.Project_Name,
            ProjectId: item?.ProjectId,
            ResourcesName: staffMembers,
            resourcesproductivity: efficiency.toFixed(2),
            percentage: percentage,
          };
        })
      );

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = managerdashctr;
