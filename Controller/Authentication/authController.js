const User = require('../../Models/Authentication/userModel')
const AppError = require('../../Utils/errorResponse')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const {promisify} = require('util')

exports.demo = (req, res) => {
    res.send('HELLO WORLD')
}

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  };

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = async (req, res, next) => {
  try {
    const {firstname, lastname, email, username, password} = req.body;
    const existingEmail = await User.findOne({email})
    const existingUsername = await User.findOne({username})
    if(existingEmail) {
        return next(new AppError('Email already exists!', 400))
    } if (existingUsername) {
        return next(new AppError('Username has been used already!', 400))
    }
    if(!firstname || !lastname || !email || !username || !password ) {
        return next(new AppError('Please fill in the required fields!', 400))
    }
    const newUser = await User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
    createSendToken(newUser, 201, res);
  } catch (err) {
     console.log(err)
  }
}

