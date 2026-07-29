const express = require('express');
const { protect } = require('./../controllers/authController');
const viewController = require('./../controllers/viewController');
const { isLoggedIn } = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const router = express.Router();

router.use(isLoggedIn);
router.get(
  '/',
  bookingController.createBookingCheckout,
  isLoggedIn,
  viewController.getOverview,
);
router.get('/tours/:slug', isLoggedIn, viewController.getTour);
router.get('/me', protect, viewController.getAccount);
router.get('/my-tours', protect, viewController.getMyTours);

//create /login route
router.get('/login', isLoggedIn, viewController.getLoginForm);

router.post('/submit-user-data', protect, viewController.updateUserData);

module.exports = router;
