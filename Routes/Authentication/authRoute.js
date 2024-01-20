const express = require('express')
const router = express.Router()
const authController = require('../../Controller/Authentication/authController')

router.get('/demo', authController.demo)

router.post('/signup', authController.signup)


module.exports = router