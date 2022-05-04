const express = require('express');

const tours = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorControllers');

const app = express();

app.use(express.json());

app.use('/api/v1/tours', tours);

app.all('*', (req, res, next) => {
  // const err = new Error(`can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
