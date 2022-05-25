const express = require('express');
const authController = require('../controllers/authenticationController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch('/updateMypassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateMe);


router
  .route('/:id')
  .get()
  .patch()
  .delete();

module.exports = router;
