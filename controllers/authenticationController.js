const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  const newUder = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUder,
    },
  });
});
