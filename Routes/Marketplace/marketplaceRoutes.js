const express = require('express');
const router = express.Router()
const storesController = require('../../Controller/Marketplace/storeController')
const filterController = require('../../Controller/Marketplace/filterController')
const productController = require ('../../Controller/Marketplace/productController')
//const searchController = require('../../Controller/Marketplace/searchController')
//const middleware = require('../../Middlewares/checkStoreOwnerhip')
//const multer = require('multer')
//const storage = multer.memoryStorage()

// store routes
router.post('/create-store', storesController.createStore)

router
.route('/get-all-stores')
.get(storesController.getAllStores)

router
.route('/get-store/:id')
 .get(storesController.getStore)

router
.route('/edit-store-info/:id')
.patch(storesController.editStoreInfo)

// product filter routes

router
.route('/add-category')
.post(filterController.addCategory)

router
.route('/get-categories')
.get(filterController.getAllCategories)


// product routes

router.post('/add-product', productController.addProduct)

router
.route('/get-products')
.get(productController.getAllProducts)

router
.route('/get-product-by-category/:categoryId')
.get(productController.getProductsByCategory)

router
.route('/get-product/:productId')
.get(productController.getProduct)

router
.route('/edit-product/:productId')
.patch(productController.editProduct)

router
.route('/delete-product/:productId')
.delete(productController.deleteProduct)

// reviews routes

router
.route('/products/:productId/add-review')
.post(productController.addReview)


// chat system

// router
// .route('/chat/send-message/:productId')
// .post(chatController.sendMessage)

// router.post('/chat/send-image/:productId', upload.single('image'), chatController.sendImage)

// router
// .route('/conversations/user')
// .get(chatController.getUserConversations)

// router 
// .route('/conversations/:conversationId')
// .get(chatController.getConversation)

// router
// .route('/chat/delete-message/:messageId')
// .delete(chatController.deleteMessage)

// router
// .route('/chat/delete-image/:messageId')
// .delete(chatController.deleteImage)




module.exports = router