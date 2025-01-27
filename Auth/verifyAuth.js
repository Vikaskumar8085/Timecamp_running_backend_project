const jwt = require("jsonwebtoken");
const {StatusCodes} = require("http-status-codes");
const credentials = require("../credential/credential");

const verifyToken = async (req, res, next) => {
  try {
    const authtoken = await req.headers.authorization.replace(/^Bearer\s/, "");
    if (!authtoken) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error("token not foound");
    }
    const decode = await jwt.verify(authtoken, credentials.JWT_SECRET);
    req.user = decode.id;
    console.log(req.user, "verify token");
    next();
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = verifyToken;
