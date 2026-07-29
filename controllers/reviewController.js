const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const getAllReviews = catchAsync(async (req, res) => {
// let filter = {};

// if (req.params.tourID) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);
//   if (!reviews) {
//     return next(new AppError('Cannot find any review', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

const setTourUserIds = (req, res, next) => {
  //allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

const createReview = factory.createOne(Review);
// const createReview = catchAsync(async (req, res) => {
//   // //allow nested routes
//   // if (!req.body.tour) req.body.tour = req.params.tourId;
//   // if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
const getAllReviews = factory.getAll(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateone(Review);
const getReview = factory.getOne(Review);

module.exports = {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getReview,
  setTourUserIds,
};
