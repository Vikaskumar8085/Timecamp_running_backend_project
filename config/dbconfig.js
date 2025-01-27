const mongoose = require("mongoose");
const credentials = require("../credential/credential");

(async function () {
  try {
    const db = await mongoose.connect(credentials.DB_URL);
    if (!db) {
      console.log("db not connected");
    } else {
      console.log("db connection established");
    }
  } catch (error) {
    console.log(error.message);
  }
})();
