const express = require('express');
const { protect } = require('./../controllers/authController');
const { restrictTo } = require('./../controllers/authController');

const {
  getAllReviews,
  deleteReview,
  createReview,
  setTourUserIds,
  updateReview,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(protect);
router
  .route('/')
  .post(restrictTo('user'), setTourUserIds, createReview)
  .get(getAllReviews);

router
  .route('/:id')
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview)
  .get(getReview);

module.exports = router;
