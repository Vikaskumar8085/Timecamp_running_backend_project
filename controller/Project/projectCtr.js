const asyncHandler = require("express-async-handler");

const projectCtr = {
  create_Project: asyncHandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = projectCtr;
