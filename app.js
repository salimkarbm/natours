const express = require('express');

const tours = require('./routes/tourRoutes');

const app = express();

app.use(express.json());

app.use('/api/v1/tours', tours);

module.exports = app;
