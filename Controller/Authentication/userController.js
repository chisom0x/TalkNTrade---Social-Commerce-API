const User = require('../../Models/Authentication/userModel')
const AppError = require('../../Utils/errorResponse')

exports.getUsers = async (req, res, next) => {
   try {
    const users = await User.find()
    res.status(200).json({
        status: 'Success',
        data: users
    })
   } catch(err) {
    console.log(err)
    next (new AppError(500, 'something went wrong!'))
   }
}

exports.getUser = async (req, res, next) => {
    try{
        const users = await User.findById(req.params.userId)
        res.status(200).json({
        status: 'Success',
        data: users
    })
    }  catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
}

exports.updateUser = async (req, res, next) => {
    try{
        const userId = req.params.userId
        const {firstname, lastname, username, email} = req.body
        const users = await User.findByIdAndUpdate(userId, 
          { 
            firstname,
            lastname,
            username,
            email
        }, {new: true}
            )
        res.status(200).json({
        status: 'Success',
        data: users
    })
    }  catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
}

exports.removeUser = async (req, res, next) => {
    try{
        const users = await User.findByIdAndDelete(req.params.userId)
        res.status(200).json({
        status: 'Success',
    })
    }  catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
}