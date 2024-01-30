const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  storeName: {
    type: String,
  },
  description: {
    type: String,
  },
  numberOfProducts: {
     type: Number,
     default: 0
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Store = new mongoose.model("Store", storeSchema);
module.exports = Store;
