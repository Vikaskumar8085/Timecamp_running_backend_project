const express = require("express");
const DepartmentCtr = require("../../controller/masterControllers/Department/DepartmentCtr");
const DesignationCtr = require("../../controller/masterControllers/Designation/DesignationCtr");
const RolesCtr = require("../../controller/masterControllers/Roles/RolesCtr");
const verifyToken = require("../../Auth/verifyAuth");
const ColorCtr = require("../../controller/masterControllers/Colors/ColorsCtr");
const HolidayListCtr = require("../../controller/masterControllers/HolidayList/HolidayListCtr");
const WeekoffSetting = require("../../models/MasterModels/Weekofsetting/WeekofSetting");
const weekoffdaysCtr = require("../../controller/masterControllers/WeekOffDays/WeekOffDaysCtr");

const masterRouter = express.Router();
// department master
masterRouter.use(verifyToken);
masterRouter.post("/create-department", DepartmentCtr.create_department);
masterRouter.get("/fetch-department", DepartmentCtr.fetch_department);
masterRouter.delete("/remove-department/:id", DepartmentCtr.remove_department);
masterRouter.put("/update-department/:id", DepartmentCtr.update_departement);

// designation master
masterRouter.post("/create-designation", DesignationCtr.create_designation);
masterRouter.get("/fetch-designation", DesignationCtr.fetch_designation);
masterRouter.delete(
  "/remove-designation/:id",
  DesignationCtr.remove_designation
);
masterRouter.put("/update-designation/:id", DesignationCtr.update_designation);
// roles master
masterRouter.post("/create-roles", RolesCtr.create_roles);
masterRouter.get("/fetch-roles", RolesCtr.fetch_roles);
masterRouter.delete("/remove-roles/:id", RolesCtr.remove_roles);
masterRouter.put("/update-roles/:id", RolesCtr.update_roles);
// color
masterRouter.post("/create-color", ColorCtr.addColor);
masterRouter.get("/fetch-color", ColorCtr.fetchColor);
masterRouter.put("/update-color/:id", ColorCtr.updateColor);
masterRouter.delete("/remove-color/:id", ColorCtr.removecolor);

// holiday
masterRouter.post("/create-holiday", HolidayListCtr.createHoliday);
masterRouter.get("/fetch-holiday", HolidayListCtr.fetchHoliday);
masterRouter.put("/update-holiday/:id", HolidayListCtr.updateHoliday);
masterRouter.delete("/remove-holiday/:id", HolidayListCtr.removeHoliday);
// week of day
masterRouter.post("/create-weekoffday", weekoffdaysCtr.createweekoffday);
masterRouter.get("/fetch-weekoffday", weekoffdaysCtr.fetchweekoffdays);
masterRouter.put("/update-holiday/:id", weekoffdaysCtr.updateweekoffdays);
masterRouter.delete("/remove-holiday/:id", weekoffdaysCtr.removeweekoffdays);

module.exports = masterRouter;
