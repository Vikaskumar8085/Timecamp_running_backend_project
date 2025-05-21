const Holiday = require("../models/Holiday");

// const WEEKEND_DAYS = ["Sunday", "Saturday"];

async function isHoliday(date) {
  const dayName = date.toLocaleDateString("en-US", {weekday: "long"});

  // Check if the date is a weekend
  //   if (WEEKEND_DAYS.includes(dayName)) {
  //     return true;
  //   }
  const weekoffDocs = await WeekoffDay.find({});
  const weekoffDays = weekoffDocs.map((doc) => doc.name); // assuming 'name' stores day string

  // Check if the date's day is a weekoff day
  if (weekoffDays.includes(dayName)) {
    return true;
  }

  // Normalize the date to check for holidays (ignoring time)
  const normalizedDate = new Date(date.toDateString());
  const holiday = await Holiday.findOne({date: normalizedDate});

  return !!holiday;
}

//  use this function like
// const isBlocked = await isHoliday(timesheetDate);
//     if (isBlocked) {
//       return res.status(400).json({ message: 'Timesheet cannot be filled on a weekend or holiday.' });
//     }

// async function getValidBacklogDates(backlogCount, endDate) {
//   const result = [];
//   let dayOffset = 1;
//   while (result.length < backlogCount) {
//     const checkDate = new Date();
//     checkDate.setDate(checkDate.getDate() - dayOffset);

//     if (checkDate <= endDate) break;

//     const isBlocked = await isHoliday(checkDate);
//     if (!isBlocked) {
//       result.push(new Date(checkDate));
//     }

//     dayOffset++;
//   }

//   return result;
// }

// const today = moment().startOf("day");
// const projectEndDate = moment(project.endDate).startOf("day");

// if (today.isAfter(projectEndDate)) {
//   return res
//     .status(403)
//     .json({
//       message: `Project ended on ${projectEndDate.format(
//         "YYYY-MM-DD"
//       )}. Cannot submit timesheet.`,
//     });
// }

//     if (today.isAfter(projectEndDate)) {
// if (user.backlogEntries > 0) {
//     const validDates = await getValidBacklogDates(user.backlogEntries, projectEndDate.toDate());
//     if (validDates.length === 0) {
//       return res.status(400).json({ message: 'No valid backlog dates available' });
//     }

//     const backlogDate = moment(validDates[0]).startOf('day');

//     await TimeSheet.create({
//       Staff_Id: userId,
//       Project_Id: projectId,
//       date: backlogDate.toDate(),
//       hours,
//     });

//     user.backlogEntries -= 1;
//     await user.save();

//     return res.status(200).json({
//       message: `Timesheet submitted for backlog date ${backlogDate.format('YYYY-MM-DD')}`,
//     });
//   } else {
//     return res.status(403).json({ message: `Project ended on ${projectEndDate.format('YYYY-MM-DD')}. No backlog entries left.` });
//   }
// }

// const holidayCount = await Holiday.countDocuments({
//     date: {
//       $lte: backlogDate.toDate(),
//       $gte: moment(projectEndDate).add(1, 'days').toDate(),
//     },
//   });
