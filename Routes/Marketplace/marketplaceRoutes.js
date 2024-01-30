const express = require('express');
const router = express.Router()
const storesController = require('../../Controller/Marketplace/storeController')
const filterController = require('../../Controller/Marketplace/filterController')
const productController = require ('../../Controller/Marketplace/productController')


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

router
.route('/add-category')
.post(filterController.addCategory)

router
.route('/get-categories')
.get(filterController.getAllCategories)

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

router
.route('/products/:productId/add-review')
.post(productController.addReview)


module.exports = router