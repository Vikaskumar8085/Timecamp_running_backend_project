const asyncHandler = require("express-async-handler");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const TimeSheet = require("../../models/Othermodels/Timesheet/Timesheet");
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

      //   //   client count
      //   const clientcount = await Client.find({
      //     Common_Id: checkcompany.Company_Id,
      //   });
      //   const projectcount = await Project.find({
      //     createdBy: user?.staff_Id,
      //   });
      //   const approvedTimesheets = await TimeSheet.find({
      //     CompanyId: checkcompany.Company_Id,
      //     approval_status: "APPROVED",
      //   });

      //   const totalHours = approvedTimesheets.reduce(
      //     (sum, entry) => sum + (parseInt(entry.hours) || 0),
      //     0
      //   );

      //   console.log("Total Approved Work Hours:", totalHours);

      const resp = {
        // projectNo: projectcount.length,
        // clientNo: clientcount.length,
        staffNo: staffcount.length,
        // totalHours: totalHours,
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
  managerdashtotalhourbyproject: asyncHandler(async (req, res) => {
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
  //    manager total hour by project
  managerdashtotalhoursbyproject: asyncHandler(async (req, res) => {
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
  //   manager hours by company
  managerdashhoursbycompany: asyncHandler(async (req, res) => {
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
  //   manager billing  status distribution
  managerdashbillingstatusdistribution: asyncHandler(async (req, res) => {
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
  // manager daily hours
  managerdashdailyhours: asyncHandler(async (req, res) => {
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
  //   manager approvel  and billing over time
  managerdashapprovelandbillingovertime: asyncHandler(async (req, res) => {
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
  //   manager project time utilization
  managerdashprojecttimeutilization: asyncHandler(async (req, res) => {
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
};

module.exports = managerdashctr;
