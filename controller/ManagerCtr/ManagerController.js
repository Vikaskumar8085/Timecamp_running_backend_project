const asyncHandler = require("express-async-handler");
const HttpStatusCodes = require("../../utils/StatusCodes/statusCodes");
const StaffMember = require("../../models/AuthModels/StaffMembers/StaffMembers");
const RoleResource = require("../../models/Othermodels/Projectmodels/RoleResources");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const managerCtr = {
  // fetch manager team
  fetchmanagerTeam: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User, please Signup");
      }

      let {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "name",
        order = "asc",
      } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      order = order === "desc" ? -1 : 1;

      const query = {
        ManagerId: user.staff_Id,
        ...(search && {
          $or: [
            {FirstName: {$regex: search, $options: "i"}},
            {Email: {$regex: search, $options: "i"}},
          ],
        }),
      };

      const fetchmanager = await StaffMember.find(query)
        .sort({[sortBy]: order})
        .skip((page - 1) * limit)
        .limit(limit);

      const totalRecords = await StaffMember.countDocuments(query);

      return res.status(HttpStatusCodes.OK).json({
        result: fetchmanager,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        success: true,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch manager projects
  fetchmanagerProjects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({message: "Unauthorized User, please Signup"});
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Searching
      const search = req.query.search || "";
      let query = {ManagerId: user.staff_Id};
      if (search) {
        query["name"] = {$regex: search, $options: "i"}; // Case-insensitive search
      }

      // Sorting
      const sortBy = req.query.sortBy || "name";
      const order = req.query.order === "desc" ? -1 : 1;

      // Fetch staff with pagination, search, and sorting
      const fetchstaff = await StaffMember.find(query)
        .sort({[sortBy]: order})
        .skip(skip)
        .limit(limit);

      if (!fetchstaff.length) {
        return res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({message: "Staff Not Found"});
      }

      // Fetch projects for each staff member
      const fetchproject = await Promise.all(
        fetchstaff.map(async (item) => {
          try {
            // Find RoleResources for the given staff_Id
            const fetchprojectbyrrids = await RoleResource.find({
              RRId: item?.staff_Id,
            });

            // Extract ProjectIds from RoleResources
            const projectids = fetchprojectbyrrids.map((rr) => rr.ProjectId);

            // Fetch projects
            const fetchproject = projectids.length
              ? await Project.find({ProjectId: {$in: projectids}})
              : [];

            // Fetch projects where staff is a direct project manager
            const fetchteamproject = await Project.find({
              Project_ManagersId: item?.staff_Id,
            });

            return {fetchproject, fetchteamproject};
          } catch (error) {
            console.error(
              `Error fetching projects for staff ${item?.staff_Id}:`,
              error
            );
            return {fetchproject: [], fetchteamproject: []};
          }
        })
      );

      // Get total records count for pagination
      const totalRecords = await StaffMember.countDocuments(query);

      return res.status(HttpStatusCodes.OK).json({
        result: fetchproject,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
      });
    } catch (error) {
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({message: error.message});
    }
  }),

  fetchmanagerActiveprojects: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User, please Signup");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchmanagerteamtasks: asyncHandler(async (req, res) => {
    try {
      const user = await StaffMember.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unauthorized User, please Signup");
      }
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = managerCtr;
