const express = require('express');
const { protect, restrictTo } = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const viewsController = require('./../controllers/viewController');

const router = express.Router();

router.use(viewsController.alerts);
router.use(protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAlBookings)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBoooking);
module.exports = router;
