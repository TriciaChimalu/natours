const express = require('express');
const { protect, restrictTo } = require('./../controllers/authController');
const {
  createTour,
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/TourController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

const aliasTopTours = require('../middlewares/aliasTour');

router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'guide', 'lead-guide'), getMonthlyPlan);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router
  .route('/')
  .post(protect, restrictTo('admin', 'lead-guide'), createTour)
  .get(getAllTours);

//geospatial queries
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
//tours-within?distance=233,center=-40,45&unit=miles
//tours-within/233/center/-40,45/mi but the way he declared it is the standard way

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);
module.exports = router;
