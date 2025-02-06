const mongoose = require("mongoose");
const DataSchema = new mongoose.Schema({
  name: String,
  email: {type: String, required: true, unique: true},
  age: Number,
});
const DataModel = mongoose.model("Data", DataSchema);
module.exports = DataModel;
const paginationSearchFilterSort = (model) => async (req, res, next) => {
  try {
    let query;

    // Copy request query
    const reqQuery = {...req.query};

    // Fields to exclude from filtering
    const removeFields = ["page", "limit", "sort", "fields", "search"];

    // Remove fields from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Convert query to string for regex search
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource with filtering
    query = model.find(JSON.parse(queryStr));

    // Search functionality (applies to Task_Name field)
    if (req.query.search) {
      query = query.find({
        Task_Name: {$regex: req.query.search, $options: "i"},
      });
    }

    // Sorting functionality
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt"); // Default sorting by newest first
    }

    // Field selection (select only specific fields)
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Executing query
    const results = await query;
    const total = await model.countDocuments(JSON.parse(queryStr));

    // Pagination results
    const pagination = {};
    if (skip + limit < total) {
      pagination.next = {page: page + 1, limit};
    }
    if (skip > 0) {
      pagination.prev = {page: page - 1, limit};
    }

    res.paginationResults = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };

    next();
  } catch (error) {
    res
      .status(500)
      .json({message: "Internal Server Error", error: error.message});
  }
};

module.exports = paginationSearchFilterSort;
