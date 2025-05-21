const asynchandler = require("express-async-handler");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const Client = require("../../../models/AuthModels/Client/Client");
const Project = require("../../../models/Othermodels/Projectmodels/Project");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const TimeSheet = require("../../../models/Othermodels/Timesheet/Timesheet");
const moment = require("moment");
const Task = require("../../../models/Othermodels/Task/Task");
const RoleResource = require("../../../models/Othermodels/Projectmodels/RoleResources");

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
        ?.select("Project_Name Start_Date End_Date createdAt");

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
      console.log(checkprojects, "proejcts");
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

  // dashboard
  // fetch recent timesheet
  fetchRecentTimesheet: asynchandler(async (req, res) => {
    try {
      // Check if user exists
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup",
        });
      }

      // Check if the company exists
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Company does not exist. Please create a company first.",
        });
      }

      // Fetch timesheets for the company
      const timesheets = await TimeSheet.find({
        CompanyId: checkcompany?.Company_Id,
      })
        .limit(5)
        .sort({updatedAt: -1});
      if (!timesheets.length) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Timesheet not found.",
        });
      }

      // Extract unique staff IDs from timesheets
      const staffIds = [...new Set(timesheets.map((t) => t.Staff_Id))];

      // Fetch staff details based on extracted staff IDs
      const staffMembers = await StaffMember.find({staff_Id: {$in: staffIds}});

      if (!staffMembers.length) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Staff members not found.",
        });
      }

      // Map staff details with their timesheet entries
      const result = timesheets.map((timesheet) => {
        const staff = staffMembers.find(
          (staff) => staff.staff_Id === timesheet.Staff_Id
        );
        return {
          staffName: staff ? `${staff.FirstName} ${staff.LastName}` : "Unknown",
          hours: timesheet.hours,
          timeAgo: timesheet.createdAt
            ? moment(timesheet.createdAt).fromNow()
            : "Unknown time",
        };
      });

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        result,
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error?.message || "Something went wrong",
      });
    }
  }),
  // fetch recent task
  fetchRecentTask: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup",
        });
      }
      // Check if the company exists
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Company does not exist. Please create a company first.",
        });
      }

      const fetchtask = await Task.aggregate([
        {$match: {Company_Id: checkcompany?.Company_Id}},
        {
          $lookup: {
            from: "staffmembers",
            localField: "staff_Id",
            foreignField: "Resource_Id",
            as: "recenttask",
          },
        },
        {
          $unwind: {
            path: "$recenttask",
            preserveNullAndEmptyArrays: false, // or true if you want to include tasks without a match
          },
        },
        {
          $project: {
            _id: 0,
            FirstName: "$recenttask.FirstName",
            Estimated_Time: "$Estimated_Time",
          },
        },
        {
          $sort: {createdAt: -1},
        },
        {
          $limit: 5,
        },
      ]);

      if (!fetchtask) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("task not found");
      }

      // const fetch

      return res
        .status(HttpStatusCodes.OK)
        .json({result: fetchtask, success: true});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch productivity leader board
  // fetchproductivityleaderboard: asynchandler(async (req, res) => {
  //   try {
  //     const user = await User.findById(req.user);
  //     if (!user) {
  //       return res.status(HttpStatusCodes.UNAUTHORIZED).json({
  //         success: false,
  //         message: "Unauthorized User. Please Signup",
  //       });
  //     }
  //     // Check if the company exists
  //     const checkcompany = await Company.findOne({UserId: user?.user_id});
  //     if (!checkcompany) {
  //       return res.status(HttpStatusCodes.BAD_REQUEST).json({
  //         success: false,
  //         message: "Company does not exist. Please create a company first.",
  //       });
  //     }

  //     const response = await StaffMember.find({
  //       CompanyId: checkcompany?.Company_Id,
  //     });

  //     if (!response) {
  //       res.status(HttpStatusCodes.NOT_FOUND);
  //       throw new Error("staff member not found");
  //     }

  //     const fetchtimesheetdata = await TimeSheet.find({
  //       Staff_Id: response?.staff_Id,
  //     });
  //     if (!fetchtimesheetdata) {
  //       res.status(HttpStatusCodes.NOT_FOUND);
  //       throw new Error("timesheet not found");
  //     }

  //     const totalhours = fetchtimesheetdata?.map((item) => {
  //       return item?.hours;
  //     });
  //     const billedhours = fetchtimesheetdata?.map((item) => {
  //       return item?.billed_hours;
  //     });

  //     const result = {
  //       percentage: Math.ceil(billedhours / totalhours) * 100,
  //       Name: response?.FirstName,
  //     };

  //     return res
  //       .status(HttpStatusCodes.OK)
  //       .json({success: rue, result: result});
  //   } catch (error) {
  //     throw new Error(error?.message);
  //   }
  // }),
  fetchProductivityLeaderboard: asynchandler(async (req, res) => {
    try {
      // Check if user exists
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup",
        });
      }

      // Check if the company exists
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Company does not exist. Please create a company first.",
        });
      }

      // Fetch all staff members for the company
      const staffMembers = await StaffMember.find({
        CompanyId: checkcompany?.Company_Id,
      });

      if (!staffMembers.length) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "No staff members found.",
        });
      }

      // Extract staff IDs
      const staffIds = staffMembers.map((staff) => staff.staff_Id);

      // Fetch timesheets for all staff members
      const timesheets = await TimeSheet.find({Staff_Id: {$in: staffIds}});

      if (!timesheets.length) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "No timesheet data found.",
        });
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
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error?.message || "Something went wrong",
      });
    }
  }),

  //  fetch project roi
  fetchProjectroi: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User. Please Signup");
      }
      // Check if the company exists
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      const staffWithTasksAndProjects = await StaffMember.aggregate([
        {
          $match: {CompanyId: checkcompany?.Company_Id},
        },
        {
          $lookup: {
            from: "tasks", // Collection name in MongoDB
            localField: "staff_Id",
            foreignField: "Resource_Id",
            as: "tasks",
          },
        },
        {
          $lookup: {
            from: "projects", // Collection name in MongoDB
            localField: "tasks.ProjectId",
            foreignField: "ProjectId",
            as: "projects",
          },
        },
        {
          $addFields: {
            TotalEstimatedTime: {$sum: "$tasks.Estimated_Time"},
            TotalCompletedTime: {$sum: "$tasks.Completed_time"},
            Percentage: {
              $cond: {
                if: {$ifNull: ["$TotalEstimatedTime", false]},
                then: {
                  $subtract: [
                    100,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$TotalEstimatedTime",
                            "$TotalCompletedTime",
                          ],
                        },
                        100,
                      ],
                    },
                  ],
                },
                else: 0,
              },
            },
          },
        },
        {
          $project: {
            FirstName: 1,
            LastName: 1,
            Email: 1,
            StaffId: "$staff_Id",
            Tasks: "$tasks",
            Projects: "$projects",
            TotalEstimatedTime: 1,
            TotalCompletedTime: 1,
            Percentage: 1,
          },
        },
      ]);

      if (!staffWithTasksAndProjects.length) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "No staff members with tasks or projects found.",
        });
      }

      return res
        .status(HttpStatusCodes.OK)
        .json({success: true, result: staffWithTasksAndProjects});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchEmployeetimehours: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup",
        });
      }
      // Check if the company exists
      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Company does not exist. Please create a company first.",
        });
      }

      const response = await T;
    } catch (error) {
      console.log(error?.message);
    }
  }),

  fetchProjectLeaderbordDecision: asynchandler(async (req, res) => {
    try {
      // Check if user exists
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized User. Please Signup",
        });
      }
      // check if the compnay exists

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Company does not exist. Please create a company first.",
        });
      }

      const fetchProject = await Project.find({
        CompanyId: {$in: checkcompany?.Company_Id},
      });

      const response = await Promise.all(
        fetchProject.map(async (item) => {
          const resources = await RoleResource.find({
            ProjectId: item?.ProjectId,
          });

          const rrids = resources.map((res) => res.RRId);
          const staffMembers = await StaffMember.find({staff_Id: {$in: rrids}});

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

module.exports = admindashboardCtr;
// find staff members
// const staffIds = await staffMembers.map((staff) => staff.staff_Id);
// const findprojects = await Project.find({
//   Project_ManagersId: {$in: staffIds},
// });
// const roleresourcesids = await RoleResource.find({RRId: {$in: staffIds}});

// const findprojectids = findprojects.map((item) => {
//   return item?.ProjectId;
// });
// const findroleprojectids = roleresourcesids?.map((item) => {
//   return item?.ProjectId;
// });

// const findprojectsdata = await Project.find({
//   $or: [
//     {ProjectId: {$in: findprojectids}},
//     {ProjectId: {$in: findroleprojectids}},
//   ],
// });
// const ids = await findprojectsdata?.map((item) => item.ProjectId);
