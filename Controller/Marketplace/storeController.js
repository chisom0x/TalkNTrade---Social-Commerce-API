const Store = require("../../Models/Marketplace/storeModel");
const User = require("../../Models/Authentication/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendErrorResponse = require('../../Utils/error')

exports.createStore = async (req, res) => {
    try {
      const cookie = req.cookies.jwt;
  
      if (!cookie) {
        return sendErrorResponse(res, 401, "Unauthorized");
      }
  
      const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET);
  
      if (!decoded) {
        return sendErrorResponse(res, 401, "Unauthorized");
      }
  
      const currentUser = await User.findById(decoded.id);
      console.log(currentUser)
  
      if (!currentUser) {
        return sendErrorResponse(res, 404, "User not found");

      }
  
      const userId = decoded.id;
      const { storeName, description } = req.body;

      if (!storeName || !description) {
        return sendErrorResponse(res, 400, "provide store name and description!");

      }
  
      const newStore = await Store.create({
        storeName: storeName,
        description: description,
        userId: userId,
      });
  
      currentUser.store = newStore._id;
      await currentUser.save();
  
      res.status(201).json({
        status: "success",
        data: {
          store: newStore,
        },
      });
    } catch (err) {
      console.error(err);
  
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => el.message);
        return res.status(400).json({
          status: "fail",
          message: "Validation error",
          errors: errors,
        });
      }

      return sendErrorResponse(res, 500, "Something went wrong");

    }
  };
  
  exports.getStore = async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
  
      if (!store) {
        return sendErrorResponse(res, 401, "store not found");

      }
  
      res.status(200).json({
        status: "success",
        data: {
          store,
        },
      });
    } catch (err) {
      console.error(err);
  
      return sendErrorResponse(res, 500, "Something went wrong");

    }
  };
  

  exports.getAllStores = async (req, res) => {
    try {
      const stores = await Store.find();
  
      res.status(200).json({
        status: "success",
        results: stores.length,
        data: {
          stores,
        },
      });
    } catch (err) {
      console.error(err);
  
      return sendErrorResponse(res, 500, "Something went wrong");

    }
  };
  

  exports.editStoreInfo = async (req, res) => {
    try {
      const { storeName, website, description } = req.body;
      const store = await Store.findByIdAndUpdate(
        req.params.id,
        {
          storeName: storeName,
          website: website,
          description: description,
        },
        { new: true }
      );
  
      if (!store) {
        return sendErrorResponse(res, 401, "Store not found");

      }
  
      res.status(200).json({
        status: "success",
        message: "Successfully updated your store information",
        data: {
          store: store,
        },
      });
    } catch (err) {
      console.error(err);
  
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => el.message);
        return res.status(400).json({
          status: "fail",
          message: "Validation error",
          errors: errors,
        });
      }
  
      return sendErrorResponse(res, 500, "something went wrong");

    }
  };
  
  exports.deleteStoreLogo = async (req, res) => {
    try {
      const storeId = req.params.storeId
      const store = await Store.findById(storeId);
      const fileName = store.storeLogo
      store.storeLogo = undefined;
      await store.save(); 
      await s3Delete(fileName);
      res.json({ status: 'success', message: 'File and URL deleted successfully' });
    } catch (err) {
      console.error(err);
      return sendErrorResponse(res, 500, "something went wrong");
    }
  };