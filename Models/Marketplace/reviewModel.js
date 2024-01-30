const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  review: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },
});

reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { productId: productId },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats[0].averageRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
    });
  }
};

// Define a post middleware to calculate average rating after saving a review
reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.productId);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
