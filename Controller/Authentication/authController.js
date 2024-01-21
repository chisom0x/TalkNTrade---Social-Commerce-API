const User = require('../../Models/Authentication/userModel')
const AppError = require('../../Utils/errorResponse')
let {Email, generateOtp} = require('../../Utils/email')
const OTPModel = require('../../Models/Authentication/otpModel')
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
    return next(new AppError('Something went wrong!', 400))
  }
}

exports.sendSignupOtp = async (req, res, next) => {
  try{
    const cookie = req.cookies.jwt
    const decoded = await promisify(jwt.verify)(
      cookie,
      process.env.JWT_SECRET
    );
    if (!decoded) {
      return res.status(401).json({
          status: 'failed',
          message: 'Unauthorized',
      });
  }
  const currentUser = await User.findById(decoded.id);
  const userId = decoded.id;
  const firstOTP = await OTPModel.findOne({ user: userId });
  let signupOtp = await generateOtp(userId); 

  try {
    if (firstOTP) {
        await OTPModel.deleteOne({ _id: firstOTP._id });
    }

    await new Email(currentUser.email).sendSignupOtp(signupOtp);

    res.status(200).json({
        status: 'success',
        message: 'OTP Sent Successfully!',
    });
} catch (error) {
    console.error(error);
    res.status(500).json({
        status: 'error',
        message: 'Error Sending OTP',
    });
}
  } catch(err) {
    console.log(err)
    next(new AppError('Something went wong!', 500))
  }
  
}

exports.verifyAccount = async (req, res, next) => {
  try {
    const cookie = req.cookies.jwt;
    const decoded = await promisify(jwt.verify)(
        cookie,
        process.env.JWT_SECRET
    );

    if (!decoded) {
        return res.status(401).json({
            status: 'failed',
            message: 'Unauthorized',
        });
    }

    const userId = decoded.id;
    const user = await User.findById(decoded.id);
    const userOtp = req.body;
    const otpDocument = await OTPModel.findOne({ user: userId });
    const now = new Date();

    if (!otpDocument) {
        return res.status(400).json({
            status: 'failed',
            message: 'No OTP found for the user',
        });
    }

    if (otpDocument.value == userOtp['userOtp']) {
        if (otpDocument.expiresAt < now) {
            return res.status(400).json({
                status: 'failed',
                message: 'OTP expired',
            });
        }
        try {
            await OTPModel.deleteOne({ _id: otpDocument._id });
            user.verifiedEmail = true;
            await user.save();
            return res.status(200).json({
                status: 'success',
                message: 'Email Verified!',
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({
                status: 'failed',
                message: 'Error verifying OTP!',
            });
        }
    } else {
        return res.status(400).json({
            status: 'failed',
            message: 'Invalid OTP!',
        });
    }
} catch (error) {
    console.error(error);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
}
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('The email you provided does not exist', 400));
    }
    
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      console.log(password, user.password)
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.error(error);
    return next(new AppError('Error logging in, Try again Later!', 500));
  }
  }

exports.logout = (req, res) => {
  try {
      res.cookie('jwt', 'logged out', {
          expires: new Date(Date.now() + 10 * 1000),
          httpOnly: true,
      });
      res.status(200).json({
          status: 'success',
          message: 'Successfully Logged out!',
      });
  } catch (error) {
      res.status(500).json({
          status: 'failed',
          message: 'Internal server error',
      });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/resetPassword/${resetToken}`;
    await new Email(user.email).sendPasswordReset(resetURL);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err)
     next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
 try{
  const cookie = req.cookies.jwt;
  const decoded = await promisify(jwt.verify)(
      cookie,
      process.env.JWT_SECRET
  );

  if (!decoded) {
      return res.status(401).json({
          status: 'failed',
          message: 'Unauthorized',
      });
  }

  const user = await User.findById(decoded.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
 } catch(err){
  console.log(err)
 next( new AppError('something went wrong', 500))
 }
 
}