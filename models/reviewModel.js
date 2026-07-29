const mongoose = require('mongoose');
const Tour = require('./tourModel');

//review /rating /createdAt /user /tour

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//preventing duplicate review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function () {
  // this.populate({
  //   path:"tour",
  //   select:"name" // the value you want it to populate
  // }).populate({
  //   path:"user",
  //   select:"name photo"
  // })

  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

//calculating average rating
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};

//the post middleware doesn't get access to next()
reviewSchema.post('save', function () {
  //this points to current review

  this.constructor.calcAverageRatings(this.tour); //this.constructor points to the model tha created it (the review)
});

//findByIdAndUpdate & findByIdAndDelete
//to get access to a document
reviewSchema.pre(/^findOneAnd/, async function () {
  console.log(this.getQuery());
  this.r = await Review.findOne(this.getQuery());
  console.log(this.r);
});

reviewSchema.post(/^findOneAnd/, async function () {
  //await this.findOne();does not WORK here, query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
