const asynchandler = require("express-async-handler");
const User = require("../../../models/AuthModels/User/User");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const moment = require("moment");
const StaffMember = require("../../../models/AuthModels/StaffMembers/StaffMembers");
const RoleResource = require("../../../models/Othermodels/Projectmodels/RoleResources");

const forecastingCtr = {
  TeamforecastReports: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized user please login");
      }
      const checkcompany = await Company.findOne({ UserId: user.user_Id });
      if (checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not found");
      }

      const minExp = parseInt(req.query.minExp) || 1;
      const maxExp = parseInt(req.query.maxExp) || 5;

      const today = moment();
      const maxJoinDate = today.clone().subtract(minExp, "years").toDate();
      const minJoinDate = today.clone().subtract(maxExp, "years").toDate();

      const response = await StaffMember.find({
        Joining_Date: { $gte: minJoinDate, $lte: maxJoinDate },
        DesignationId: { $in: 2 },
      });

      const fetchfilterprojects = await Promise.all(
        response.map(async (item) => {
          const resp = await RoleResource.find({
            RRId: { $in: response.map((emp) => emp.staff_Id) },
            RId: { $in: 2 },
          });

          const projectids = await resp.map((ids) => ids.ProjectId);

          const findProject = await Project.find({
            ProjectId: { $in: projectids },
          });
          const today = moment().startOf("day");

          const activeProjects = findProject.filter((project) => {
            const projectEndDate = moment(project?.endDate).startOf("day");
            return projectEndDate.isSameOrAfter(today);
          });

          // Step 2: Extract active Project IDs
          const projectIds = activeProjects.map((project) => project.ProjectId);

          // Step 3: Fetch RoleResource entries for those projects
          const roleResources = await RoleResource.find({
            ProjectId: { $in: projectIds },
          });

          // Step 4: Group by RRid and sum Engagement_Ratio
          const engagementMap = {};

          roleResources.forEach((rr) => {
            const rrid = rr.RRid;
            if (!engagementMap[rrid]) {
              engagementMap[rrid] = 0;
            }
            engagementMap[rrid] += rr.Engagement_Ratio;
          });

          // Step 5: Filter RRid where total ratio < 100
          const availableRRids = Object.entries(engagementMap)
            .filter(([_, totalRatio]) => totalRatio < 100)
            .map(([rrid]) => rrid);

          // ✅ Result
          console.log(availableRRids);

          const fetchstaff = await StaffMember.find({
            staff_Id: { $in: availableRRids },
          });
          return fetchstaff;
        })
      );

      // const projectResponse = await Project.find({
      //   ProjectId: { $in: resp.map((emp) => emp.ProjectId) },
      // });

      // if()
      // const projectlength = projectResponse.length;
      // if (!response || response.length === 0) {
      //   res.status(HttpStatusCodes.NOT_FOUND);
      //   throw new Error(
      //     "No staff members found with the specified experience range"
      //   );
      // }

      // const findproject = await Project.find({})

      // const result = response.map((emp) => {
      //   const years = today.diff(moment(emp.Joining_Date), "years");
      //   const months = today.diff(
      //     moment(emp.Joining_Date).add(years, "years"),
      //     "months"
      //   );

      //   return {
      //     name: emp.name,
      //     joiningDate: emp.Joining_Date,
      //     // designation: emp.designationId.name,
      //     experience: `${years} years ${months} months`,
      //     experienceYears: years,
      //   };
      // });

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Forecasting report",
        data: fetchfilterprojects,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  projectforecastingReports: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("UnAuthorized user please login");
      }
      const checkcompany = await Company.findOne({ UserId: user.user_Id });
      if (checkcompany) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("Company Not found");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = forecastingCtr;
