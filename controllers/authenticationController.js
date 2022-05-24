const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    },
  });
}
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  createSendToken(newUser, 201, res)
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email exists
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  // chheck if email and password are correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorect email or password', 401));
  }
  createSendToken(user, 200, res)
  
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get token and check if it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! please login to gain access', 401)
    );
  }
  // verifiy token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belongs to the token nolonger exist.', 401)
    );
  }
  //check if user change password after the token was issue
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User Recently changed password! Please login again', 401)
    );
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }
  //Genrate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send token to user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `we're sending you this email because you requested a password reset. Click this link:${resetUrl} to reset your password. \n if you did not request a password reset, you can ignore this email. Your password will not be changed.`;
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token only valid for 10 mins',
      message,
    });
    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the token to email, try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token

  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //if token has not expired and there is user
  if (!user) {
    return next(new AppError('Invalid Token or Token has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmpassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // update user passwordChangedAt for current user

  //Login user
  createSendToken(user, 200, res)
  
});

exports.updatePassword = catchAsync(async (req, res, next) => {
//Get user from collection
const user = await User.findById(req.user.id).select('+password')

//check if user POSTED password is correct
if(! (await user.correctPassword(req.body.currentpassword, user.password))){
  return next(new AppError("Your current password is incorrect.", 401))
}
//update password
user.password = req.body.password
user.confirmPassword = req.body.confirmPassword
await user.save()
createSendToken(user, 200, res)
})