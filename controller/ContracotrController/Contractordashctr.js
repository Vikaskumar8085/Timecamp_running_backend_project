const asynchandler = require("express-async-handler");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const moment = require("moment");
const contractordashctr = {
  // fetch dashboard Counter
  fetchdashboardCounter: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please signin ");
      }

      const findprojectinroleresource = await RoleResource.find({
        RRId: user?.staff_Id,
      });
      const projectcount = await findprojectinroleresource.map(
        (Item) => Item.ProjectId
      );
      const projectcountLength = projectcount.length;

      const countproject = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
        ],
      });
      const countprojectLength = countproject.length;
      const counttotalProject = projectcountLength + countprojectLength;

      const projectids = countproject.map((proj) => proj.ProjectId); // No need for `await` here

      const approvedTimesheets = await TimeSheet.find({
        project: {$in: projectids},
        approval_status: "APPROVED",
      });

      const totalHours = approvedTimesheets.reduce(
        (sum, entry) => sum + (Number(entry.hours) || 0),
        0
      );

      const data = {
        totalhours: totalHours, // Fixed: `totalHours.length` was incorrect
        totalproject: counttotalProject,
      };

      return res.status(HttpStatusCodes.OK).json({success: true, result: data});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // Total project
  fetchdashtotalproject: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please signin");
      }

      // Fetch projects the user is associated with via roles and manager/creator
      const findprojectinroleresource = await RoleResource.find({
        RRId: user?.staff_Id,
      });
      const projectcount = findprojectinroleresource.map(
        (item) => item.ProjectId
      );

      // Query projects based on multiple roles: creator, manager, or assigned
      const fetchrescentproject = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
          {ProjectId: {$in: projectcount}},
        ],
      });

      const result = fetchrescentproject.map(
        ({Project_Name, Start_Date, End_Date}) => ({
          ProjectName: Project_Name,
          startdate: Start_Date,
          enddate: End_Date,
        })
      );

      return res.status(HttpStatusCodes.OK).json({success: true, result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //    Total hour by resources

  fetchdashhoursbyresources: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please signin");
      }

      // const fetchtimesheet = await TimeSheet.find({Staff_Id: user?.staff_Id});
      // const hoursByDay = fetchtimesheet.reduce((result, item) => {
      //   const dateKey = moment(item.day).format("DD/MM/YYYY"); // Format date as YYYY-MM-DD
      //   if (!result[dateKey]) {
      //     result[dateKey] = 0; // Initialize if not already present
      //   }
      //   result[dateKey] += item.hours; // Add hours to the respective day
      //   return result;
      // }, {});

      // // Convert the result into an array of {date, totalHours}
      // const dayWiseHours = Object.keys(hoursByDay).map((date) => ({
      //   date,
      //   totalHours: hoursByDay[date],
      // }));

      // return res
      //   .status(HttpStatusCodes.OK)
      //   .json({success: true, result: dayWiseHours});

      const fetchtimesheet = await TimeSheet.aggregate([
        {
          $match: {Staff_Id: user?.staff_Id}, // Match the current user's time sheets
        },
        {
          $project: {
            date: 1,
            hours: 1,
            ProjectId: 1, // ProjectId to later join with the Project collection
            formattedDate: {$dateToString: {format: "%Y-%m-%d", date: "$day"}}, // Format the date
          },
        },
        {
          $group: {
            _id: {date: "$formattedDate", ProjectId: "$ProjectId"}, // Group by formatted date and ProjectId
            totalHours: {$sum: "$hours"}, // Sum the hours for each group
          },
        },
        {
          $lookup: {
            from: "projects", // Assuming the collection name is 'projects'
            localField: "ProjectId", // ProjectId in TimeSheet
            foreignField: "ProjectId", // ProjectId in Project collection
            as: "projectDetails", // The result of the join will be stored here
          },
        },
        {
          $unwind: "$projectDetails", // Unwind the project details to get individual project data
        },
        {
          $project: {
            date: "$day",
            totalHours: 1,
            projectName: "$projectDetails.Project_Name", // The project name
            projectId: "$projectDetails.ProjectId", // The project ID
            _id: 0,
          },
        },
        {
          $sort: {date: 1}, // Optional: Sort by date
        },
      ]);
      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: fetchtimesheet});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   fetch contractor total Hour by resources
  fetchcontractorTotalhoursbyResources: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      //   const fetchstaff = await StaffMember.find({ManagerId: user?.staff_Id});
      //   if (!fetchstaff || fetchstaff.length === 0) {
      //     res.status(HttpStatusCodes.NOT_FOUND);
      //     throw new Error("Manager Team Not Found");
      //   }
      //   const staffIds = fetchstaff?.map((staff) => {
      //     return staff.staff_Id;
      //   });

      const staffTimesheets = await TimeSheet.find({Staff_Id: user.staff_Id});
      console.log(staffTimesheets);
      if (!staffTimesheets || staffTimesheets.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("staff Not founds");
      }

      const result = {
        StaffName: user.FirstName,
        totalBilledHours: staffTimesheets.map((sheet) => sheet.billed_hours),
        totalHours: staffTimesheets.map((sheet) => sheet.hours),
      };

      return res.status(HttpStatusCodes.OK).json({success: true, result});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // fetch contractor Total hours by Projects
  fetchcontractorTotalhoursbyprojects: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkprojects = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
        ],
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
        (sum, entry) => sum + (Number(entry.billed_hours) || 0),
        0
      );

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result: checkprojects.map((proj) => ({
          ProjectName: proj.Project_Name,
          totalBilledHours,
        })),
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //   fetch contractor  hours by company
  fetchcontractorTotalHoursByCompany: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
        ],
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      const projectIds = checkprojects.map((proj) => proj.ProjectId);

      // Find all timesheets for the projects
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
  //   billing status distribution
  fetchcontractorbillingstatusdistribution: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
        ],
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      const projectIds = checkprojects.map((proj) => proj.ProjectId);
      const billedTimesheets = await TimeSheet.find({
        project: {$in: projectIds},
        billing_status: "BILLED",
      });

      const notBilledTimesheets = await TimeSheet.find({
        project: {$in: projectIds},
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
  fetchcontractorprojecttimeutilization: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
        ],
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      const projectids = checkprojects.map((proj) => proj.ProjectId);

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
  // fetch contractor approvel billed hours over time
  fetchcontractorapprovelbilledhourovertime: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
        ],
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      const projectids = checkprojects.map((proj) => proj.ProjectId);

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
  // fetch contractor daily hours
  fetchcontractordailyhours: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const checkprojects = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
        ],
      });

      if (!checkprojects.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Project Not Found"});
      }
      // Extract all project IDs
      const projectids = checkprojects.map((proj) => proj.ProjectId);

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

module.exports = contractordashctr;
