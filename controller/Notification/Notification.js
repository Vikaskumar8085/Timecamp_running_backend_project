const asyncHandler = require("express-async-handler");

const NotificationCtr = {
  // add Notification
  createNotification: asyncHandler(async (req, res) => {
    try {
      const response = await Notification(req.body);
      if (!response) {
      }
      await response.save();

      return res.status(201).json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch Notification
  fetchNotification: asyncHandler(async (req, res) => {
    try {
      const response = await Notification.find();
      return res.status(200).json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
  // remove Notification
  removeNotification: asyncHandler(async (req, res) => {
    try {
      const response = await NotificationCtr.findByIdAndDelete({
        _id: req.params.id,
      });
      return res.status(200).json({success: true, result: response});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = NotificationCtr;
