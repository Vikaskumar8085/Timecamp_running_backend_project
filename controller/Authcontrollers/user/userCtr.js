const asynchandler = require("express-async-handler");

const userCtr = {
  login: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = userCtr;
