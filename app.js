const express = require('express');
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const tours = require('./routes/tourRoutes');
const users = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorControllers');

const app = express();

// set security HTTP headers
app.use(helmet())

// limit request for APIs
const limiter = rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter)

app.use(express.json({limit:'10kb'}));

//DATA sanitazation against noSQL query injection
app.use(mongoSanitize())

// Data sanitazation against XSS
app.use(xss())

// prevent parameter pollution 
app.use(hpp({whitelist:['duration', 'price','difficulty','ratingsAverage','maxGroupSize','ratingsQuantity']}))

app.use('/api/v1/users', users);
app.use('/api/v1/tours', tours);

app.all('*', (req, res, next) => {
  // const err = new Error(`can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
