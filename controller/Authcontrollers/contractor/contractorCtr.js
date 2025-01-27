const asynchandler = require("express-async-handler");

const contractorCtr = {
  // create contractor
  create_contractor: asynchandler(async (req, res) => {
    try {
    } catch (error) {}
  }),
  //   fetch controactor
  fetch_all_contractor: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  //   active contractor
  fetch_active_contractor: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error.message);
    }
  }),

  //   in active contractor
  fetch_inactive_contractor: asynchandler(async (req, res) => {
    try {
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};

module.exports = contractorCtr;
