const express = require('express')
const router = express.Router()
const authController = require('../../Controller/Authentication/authController')

router.post('/signup', authController.signup)
router.get('/get-signup-otp', authController.sendSignupOtp)
router.post('/verify-account', authController.verifyAccount)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.updatePassword);

module.exports = router