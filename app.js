const express = require('express');

const tours = require('./routes/tourRoutes');

const app = express();

app.use(express.json());

app.use('/api/v1/tours', tours);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `can't find ${req.originalUrl} on this server`,
  });
  next();
});

module.exports = app;
