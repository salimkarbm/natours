const Tour = require('../models/tourModel');

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create({ ...req.body });
    res.status(201).json({
      status: 'success',
      data: {
        tours: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(201).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
