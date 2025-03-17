const asyncHandler = require("express-async-handler");
const Client = require("../../models/AuthModels/Client/Client");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");

const clientdashctr = {
  clientdashcounter: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user).lean().exec();
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User !Please Sign up");
      }
      const projectcount = await Project.find({
        clientId: user?.Client_Id,
      });
      const projectids = await projectcount.map((item) => item.ProjectId);

      const approvedTimesheets = await TimeSheet.find({
        project: {$in: projectids},
        approval_status: "APPROVED",
      });

      const totalHours = approvedTimesheets.reduce(
        (sum, entry) => sum + (parseInt(entry.hours) || 0),
        0
      );
      const result = {
        totalproject: projectcount.length,
        totalHours: totalHours,
      };
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  clientdashboardRecentProject: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please signup");
      }

      const findProjects = await Project.find({clientId: user?.Client_Id});

      if (findProjects.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Project not found");
      }

      const result = {
        ProjectName: findProjects.map((item) => item.Project_Name),
        startdata: findProjects.map((item) => item.Start_Date),
        enddata: findProjects.map((item) => item.End_Date),
      };

      return res.status(HttpStatusCodes.OK).json({success: true, result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // client Time summary

  // clienttotalhoursbyresources: asyncHandler(async (req, res) => {
  //   try {
  //     const user = await Client.findById(req.user);
  //     if (!user) {
  //       res.status(HttpStatusCodes.UNAUTHORIZED);
  //       throw new Error("Unautorized User Please Singup");
  //     }

  //     const findprojects = await Project.find({clientId: user?.Client_Id});
  //     const projectmanagerids = await findprojects.map(
  //       (item) => item?.Project_ManagersId
  //     );

  //     const fetchresourcesids = await StaffMember.find({
  //       staff_Id: projectmanagerids,
  //     });

  //     const projectIds = findprojects.map((project) => project.ProjectId);
  //     const fetchroleresourcesids = await RoleResource.find({
  //       ProjectId: {$in: projectIds},
  //     });

  //     const fetchrrids = await fetchroleresourcesids.map((item) => item.RRId);

  //     const staffTimesheets = await TimeSheet.find({
  //       $or: [
  //         {Staff_Id: {$in: fetchrrids}},
  //         {Staff_Id: {$in: fetchresourcesids}},
  //       ],
  //     });

  //     if (!staffTimesheets || staffTimesheets.length === 0) {
  //       res.status(HttpStatusCodes.NOT_FOUND);
  //       throw new Error("Staff not found");
  //     }

  //     const result = {
  //       // StaffName: fetchteam.FirstName ||,
  //       totalBilledHours: staffTimesheets.map((sheet) => sheet.billed_hours),
  //       totalHours: staffTimesheets.map((sheet) => sheet.hours),
  //     };

  //     return res.status(HttpStatusCodes.OK).json({
  //       success: true,
  //       result: result,
  //     });
  //   } catch (error) {
  //     throw new Error(error?.message);
  //   }
  // }),

  // client total hours by resources
  clienttotalhoursbyresources: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({error: "Unauthorized User Please Signup"});
      }

      // Find projects for the client
      const projects = await Project.find({clientId: user.Client_Id});
      const projectIds = projects
        .map((project) => project.ProjectId)
        .filter(Boolean);
      const projectManagerIds = projects
        .map((project) => project.Project_ManagersId)
        .filter(Boolean);

      // Find staff members who are project managers
      const resources = await StaffMember.find({
        staff_Id: {$in: projectManagerIds},
      });
      const resourceIds = resources.map((resource) => resource.staff_Id);

      // Find role resources
      const roleResources = await RoleResource.find({
        ProjectId: {$in: projectIds},
      });
      const rrIds = roleResources
        .map((resource) => resource.RRId)
        .filter(Boolean);

      // Find staff timesheets
      const staffTimesheets = await TimeSheet.find({
        Staff_Id: {$in: [...rrIds, ...resourceIds]},
      });

      if (!staffTimesheets.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({error: "Staff not found"});
      }

      // Extract unique staff IDs from timesheets
      const staffIds = [
        ...new Set(staffTimesheets.map((sheet) => sheet.Staff_Id)),
      ];

      // Fetch staff details (including FirstName)
      const staffDetails = await StaffMember.find({
        staff_Id: {$in: staffIds},
      }).select("staff_Id FirstName");

      // Map staff details with timesheet data
      const result = staffTimesheets.map((sheet) => {
        const staff = staffDetails.find(
          (s) => s.staff_Id.toString() === sheet.Staff_Id.toString()
        );
        return {
          StaffName: staff ? staff.FirstName : "Unknown",
          billed_hours: sheet.billed_hours,
          hours: sheet.hours,
        };
      });

      return res.status(HttpStatusCodes.OK).json({success: true, result});
    } catch (error) {
      return res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({error: error.message});
    }
  }),
  // client total hours by Projects
  clientTotalHourByProjects: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please Signup");
      }

      const projects = await Project.find({clientId: user.Client_Id});
      if (!projects.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No projects found for this client");
      }

      const projectIds = projects.map((proj) => proj.ProjectId);
      console.log(projectIds);

      // Fetch timesheets grouped by project
      const timesheets = await TimeSheet.find({project: {$in: projectIds}});

      if (!timesheets.length) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("No timesheets found for the client's projects");
      }

      // Calculate billed hours per project
      const projectHoursMap = timesheets.reduce((acc, timesheet) => {
        const projectId = timesheet.project;
        const hours = Number(timesheet.billed_hours) || 0;

        acc[projectId] = (acc[projectId] || 0) + hours;
        return acc;
      }, {});

      const result = projects.map((proj) => ({
        ProjectName: proj.Project_Name,
        totalBilledHours: projectHoursMap[proj.ProjectId] || 0,
      }));

      return res.status(HttpStatusCodes.OK).json({Projects: result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // client Totalhour by company
  clienttotalhoursbycompany: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please Signup");
      }
      const checkprojects = await Project.find({
        clientId: user.Client_Id,
      });
      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      const projectIds = checkprojects.map((proj) => proj.ProjectId);
      const findtimesheet = await TimeSheet.find({project: {$in: projectIds}});
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
  clientbillingstatusdistribution: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please Signup");
      }
      const checkprojects = await Project.find({
        clientId: user.Client_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      let projectids = await checkprojects.map((proj) => proj.ProjectId);
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

      const result = {
        BILLED: billedTimesheets.length,
        NOT_BILLED: notBilledTimesheets.length,
      };

      res.status(200).json({success: true, data: result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  clientprojecttimeutilization: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please Signup");
      }
      const checkprojects = await Project.find({
        clientId: user.Client_Id,
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      let projectids = await checkprojects.map((proj) => proj.ProjectId);

      // Find all timesheets for the projects
      const findtimesheets = await TimeSheet.find({project: {$in: projectids}});

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
  clientapprovelandbillingovertime: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please Signup");
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
  clientprojectdailyHours: asyncHandler(async (req, res) => {
    try {
      const user = await Client.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User Please Signup");
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
};

module.exports = clientdashctr;
