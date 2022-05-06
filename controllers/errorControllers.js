const AppError = require('../utils/appError');

const unhandledCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new AppError(message, '400');
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendProError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({ status: 'fail', message: 'something went wrong' });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === ' CastError') {
      error = unhandledCastErrorDB(error);
    }
    sendProError(error, res);
  }
};
