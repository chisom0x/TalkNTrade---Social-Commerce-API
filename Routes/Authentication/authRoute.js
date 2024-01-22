const express = require('express')
const router = express.Router()
const authController = require('../../Controller/Authentication/authController')
const userController = require('../../Controller/Authentication/userController')

router.post('/signup', authController.signup)
router.get('/get-signup-otp', authController.sendSignupOtp)
router.post('/verify-account', authController.verifyAccount)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.updatePassword);

router.get('/users', userController.getUsers)
router.get('/user/:userId', userController.getUser)
router.patch('/user/update-user/:userId', userController.updateUser)
router.delete('/user/remove-user/:userId', userController.removeUser)


module.exports = router