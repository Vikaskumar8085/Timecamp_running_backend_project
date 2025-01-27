const asynchandler = require("express-async-handler");

const adminCtr = {
  create_admin: asynchandler(async (req, res) => {
    try {
      // const respons = await
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = adminCtr;
