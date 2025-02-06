const asyncHandler = require("express-async-handler");

const NotificationCtr = {
  createNotification: asyncHandler(async (req, res) => {

    try {
    const response= await Notification
    
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  fetchNotification: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = NotificationCtr;
