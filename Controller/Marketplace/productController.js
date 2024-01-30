const Product = require("../../Models/MarketPlace/productModel");
const User = require("../../Models/Authentication/userModel");
const Store = require("../../Models/Marketplace/storeModel");
const Review = require("../../Models/MarketPlace/reviewModel");
const Category = require("../../Models/Marketplace/filterModel");
const sendErrorResponse = require('../../Utils/error')
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.addProduct = async (req, res) => {
  try {
    const cookie = req.cookies.jwt;
    const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET);

    if (!decoded) {
      return sendErrorResponse(res, 401, "Unauthorized");
    }

    const user = await User.findById(decoded.id);
    const storeId = user.store;
    const store = await Store.findById(storeId);
    const sellerName = store.storeName;
    const categoryId = req.body.categoryId;
    const category = await Category.findById(req.body.categoryId);
    const categoryName = category.category;
    const { productName, productDescription, productPrice } = req.body;

    const newProduct = await Product.create({
      productName,
      productPrice,
      sellerName,
      storeId,
      productDescription,
      categoryId,
      categoryName,
    });

    await Store.findByIdAndUpdate(
      storeId,
      {
        $push: {
          products: newProduct._id,
        },
        $inc: { numberOfProducts: 1 },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Product posted successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, 500, "something went wrong");
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { productName, productPrice, productDescription } = req.body;
    const productId = req.params.productId;

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        productName,
        productPrice,
        productDescription,
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    sendErrorResponse(res, 500, "something went wrong");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return sendErrorResponse(res, 404, "Product not found");
    }

    res.status(200).json({
      status: "success",
      message: "Successfully deleted!",
    });
  } catch (err) {
    sendErrorResponse(res, 400, "Error deleting product");
  }
};

exports.getAllProducts = async (req, res) => {
  try{
      const product = await Product.find();
  res.status(200).json({
    status: "success",
    data: product,
  });
  } catch(err) {
    sendErrorResponse(res, 400, "Error getting products");
  }
};

exports.getProduct = async(req, res) => {
  try{
 const product = await Product.findById(req.params.productId)
  res.status(200).json({
    status: "success",
    data: {
      product
    },
  });
  } catch (err) {
    console.log(err)
    sendErrorResponse(res, 400, "Error getting product");
  }
}

exports.getProductsByCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
    const products = await Product.find({ categoryId: categoryId });

    res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, 400, "Error applying filter");
  }
};

exports.addReview = async (req, res) => {
 try{
  const cookie = req.cookies.jwt;
  const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET);

  if (!decoded) {
    return res.status(401).json({
      status: "failed",
      message: "Unauthorized",
    });
  }

  const user = await User.findById(decoded.id);
  const username = `${user.firstname} ${user.surname}`;
  const productId = req.params.productId;
  const review = req.body.review;
  const rating = req.body.rating;
  const newReview = await Review.create({
    username: username,
    review: review,
    rating: rating,
    productId: productId,
  });

  await Product.findByIdAndUpdate(
    productId,
    { $push: { reviews: newReview }, $inc: { numberOfReviews: 1 } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: newReview,
  });
 } catch (err) {
  sendErrorResponse(res, 400, "Error adding review");
 }
};
