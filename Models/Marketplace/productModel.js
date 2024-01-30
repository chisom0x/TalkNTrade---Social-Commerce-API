const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
  },
  productDescription: {
    type: String,
  },
  productPrice: {
    type: Number,
  },
  sellerName: {
    type: String,
  },
  productImages: [String],
  categoryId: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
  },
  categoryName: {
    type: String,
  },
  brandName: {
    type: String,
  },
  reviews: [
    {
      username: String,
      review: String,
      rating: Number,
    },
  ],
  averageRating: {
    type: Number,
    default: 4.5,
    set: (val) => Math.round(val * 10) / 10,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  storeId: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
  },
});

productSchema.index({
  productName: "text",
  categoryName: "text",
  brandName: "text",
});

productSchema.methods.updateAverageRating = function () {
  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  this.averageRating =
    this.numberOfReviews > 0 ? totalRating / this.numberOfReviews : 0;
};

productSchema.pre("save", function (next) {
  this.updateAverageRating();
  next();
});

const Products = new mongoose.model("Products", productSchema);
module.exports = Products;
