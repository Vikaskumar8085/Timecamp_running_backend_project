const jwt = require("jsonwebtoken");
const credentials = require("../credential/credential");

const generateToken = async ({id}) => {
  return await jwt.sign({id: id}, credentials.JWT_SECRET, {expiresIn: "720hr"});
};

module.exports = generateToken;
