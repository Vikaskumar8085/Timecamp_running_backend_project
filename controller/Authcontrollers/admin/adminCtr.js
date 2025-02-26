const asynchandler = require("express-async-handler");
const HttpStatusCodes = require("../../../utils/StatusCodes/statusCodes");
const User = require("../../../models/AuthModels/User/User");
const Company = require("../../../models/Othermodels/Companymodels/Company");
const Notification = require("../../../models/Othermodels/Notification/Notification");

const adminCtr = {
  // create admin ctr
  create_admin: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }

      const checkcompany = await Company.findOne({UserId: user?.user_id});
      if (!checkcompany) {
        res.status(HttpStatusCodes?.BAD_REQUEST);
        throw new Error("company not exists please create first company");
      }
      console.log(checkcompany);

      const createuser = await User(req.body);
      if (!createuser) {
        res.status(HttpStatusCodes.BAD_REQUEST);
        throw new Error("User not found");
      } else {
        await createuser.save();
        await Company.updateOne(
          {Company_Id: checkcompany?.Company_Id},
          {$push: {UserId: createuser.user_id}}
        );
      }

      if (createuser.length !== 0) {
        await Notification({
          SenderId: user?.user_id,
          ReciverId: createuser?.user_id,
          Name: user?.FirstName,
          Description: `Dear ${createuser?.FirstName}, you have been successfully added as an Admin in ${checkcompany?.Company_Name} company. Welcome aboard!`,
          IsRead: false,
        }).save();
      }
      return res
        .status(HttpStatusCodes.CREATED)
        .json({success: true, message: "admin created successfully"});
    } catch (error) {
      throw new Error(error?.message);
    }
  }),

  // fetch admin

  getalladmin: asynchandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error("Unautorized User Please Singup");
      }
      const getAdminuser = await Company.findOne({UserId: user?.user_id});
      if (!getAdminuser && getAdminuser.length === 0) {
        res.status(HttpStatusCodes.NOT_FOUND);
        throw new Error("admin Not found");
      }
      // const result = await User.aggregate([
      //   // Stage 2: Lookup to join with the Company collection
      //   {
      //     $lookup: {
      //       from: "companies", // The collection to join with
      //       localField: "user_id", // The field from the User collection
      //       foreignField: "UserId", // The field from the Company collection
      //       as: "companyDetails", // The output array field
      //     },
      //   },

      //   // Stage 3: Optionally, unwind the array if it contains a single document
      //   {
      //     $unwind: {
      //       path: "$companyDetails",
      //       preserveNullAndEmptyArrays: false,
      //     },
      //   },
      //   {
      //     $project: {
      //       FirstName: 1,
      //       LastName: 1,
      //       Email: 1,
      //       Photo: 1,
      //       Role: 1,
      //     },
      //   },
      // ]);

      let QueryObj = {};
      QueryObj = {user_id: getAdminuser.UserId};
      const result = await User.find(QueryObj).lean().exec();

      return res.status(200).json({
        success: true,
        message: "successfully fetch adimn data",
        result: result,
      });
    } catch (error) {
      throw new Error(error?.message);
    }
  }),
};
module.exports = adminCtr;
