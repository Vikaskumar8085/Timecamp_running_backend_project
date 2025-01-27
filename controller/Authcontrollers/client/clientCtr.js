const asyncHandler = require("express-async-handler");
const Client = require("../../../models/AuthModels/Client/Client");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");

const clientCtr = {
  // client creation
  create_client: asyncHandler(async (req, res) => {
    try {
      const response = await Client(req.body);
      if (!response) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("bad requests");
      } else {
        await response.save();
      }

      return res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: "client created successfully",
        result: response,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch clients
};
module.exports = clientCtr;
