const Category = require("../../Models/Marketplace/filterModel");
const sendErrorResponse = require('../../Utils/error')

exports.addCategory = async (req, res) => {
  const { category } = req.body;

  try {
    const newCategory = await Category.create({ category });
    res.status(200).json({
      status: "success",
      data: newCategory,
    });
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, 500, "something went wrong");
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, 500, "something went wrong");
  }
};
