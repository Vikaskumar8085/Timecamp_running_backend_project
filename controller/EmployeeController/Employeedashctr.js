const asynchandler = require("express-async-handler");

const employeedashctr = {
  fetchemployeedashboardCounter: asynchandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Un Authorized User please signin ");
      }

      const countproject = await Project.find({
        $or: [
          {createdBy: user?.staff_Id},
          {Project_ManagersId: user?.staff_Id},
        ],
      });

      const projectIds = countproject.map((proj) => proj.ProjectId); // No need for `await` here

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
        totalproject: countproject.length,
      };

      console.log(data);

      return res.status(HttpStatusCodes.OK).json({success: true, result: data});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  //    Total hour by resources
  //   fetch employee total Hour by resources
  fetchemployeeTotalhoursbyResources: asynchandler(async (req, res) => {
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
  // fetch employee Total hours by Projects
  fetchemployeeTotalhoursbyprojects: asynchandler(async (req, res) => {
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
  //   fetch employee  hours by company
  fetchemployeeTotalHoursByCompany: asynchandler(async (req, res) => {
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
  fetchemployeebillingstatusdistribution: asynchandler(async (req, res) => {
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
  fetchemployeeprojecttimeutilization: asynchandler(async (req, res) => {
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
  // fetch employee approvel billed hours over time
  fetchemployeeapprovelbilledhourovertime: asynchandler(async (req, res) => {
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
  // fetch employee daily hours
  fetchemployeedailyhours: asynchandler(async (req, res) => {
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

module.exports = employeedashctr;
