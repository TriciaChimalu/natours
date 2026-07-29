const Tour = require('../models/tourModel');
const sharp = require('sharp');
const multer = require('multer');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage(); //images be stored as a buffer
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

const resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  // 1)cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(200, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2)images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );

  next();
});

// const createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// try {
//   // const newTour = new Tour({})
//   // newTour.save()

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// } catch (err) {
//   console.log(err);
//   res.status(400).json({
//     status: 'fail',
//     message: err.message,
//   });
// }

// const getAllTours = catchAsync(async (req, res, next) => {
// try {
//   console.log('query is:', req.query);
// build query
// 1. Filtering

// const queryObj = { ...req.query };
// const excludeFields = ['page', 'sort', 'limit', 'fields'];

// excludeFields.forEach((el) => delete queryObj[el]);

// 2)Advanced Filtering
// { difficulty:easy ,duration:{$gte: 5}}
// gte,gt,lte,lt

// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
// // console.log(queryStr);

// let query = Tour.find(JSON.parse(queryStr));

//2.Sorting

// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   console.log(sortBy);
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }

// const query = await Tour.find()
//   .where('difficulty')
//   .equals('easy')
//   .where('duration')
//   .equals(5);

//3 Field limiting
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');

//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

//4 Pagination
//page=2&limit=10 the user wants page no 2 with 10 results per page , 1-10 page 1,11-20 page 2
//*1 converts a sring to a number
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);
// console.log(req.query);
// if (req.query.page) {
//   const numTour = await Tour.countDocuments();
//   if (skip >= numTour) throw new Error('This page does not exist');
// }

//execute query
//   const features = new APIFeaturs(Tour.find(), req.aliasQuery || req.query)
//     .filter()
//     .sort()
//     .limit()
//     .paginate();
//   const tours = await features.query;
//   // const tours = await query;

//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// const getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // .populate({
//   //   path:'guides',
//   //   select:'-__v -passwordChangedAt'
//   // }); //populating the actual data of a guide

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   // Tour.findOne({_id:req.params.id})

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// const updateTour = catchAsync(async (req, re, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
const getAllTours = factory.getAll(Tour);
const updateTour = factory.updateone(Tour);
const deleteTour = factory.deleteOne(Tour);
const createTour = factory.createOne(Tour);
const getTour = factory.getOne(Tour, { path: 'reviews' });
// const deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        totalPrice: { $sum: '$price' },
        avgRating: { $avg: '$ratingAverage' },
        avgprice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgprice: 1 } }, //1 for ascending
    // { $match: { _id: { $ne: 'EASY' } } },// to remove the ones EASY
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    }, //to select document
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

//'/tours-within/:distance/center/:latlng/unit/:unit'
//tours-distance/233/center/-40,45/mi
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const { lat, lng } = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //convertimg to radians (dividing by the radius oof the earth)

  if (!lat || !lng) {
    next(
      new AppError(
        'Please Provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    data: {
      results: 'success',
      data: tours,
    },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const { lat, lng } = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Plase provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  //the aggregation pipleline is used for calculation and called on the model

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distances',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'sucess',
    results: tours.ength,
    data: {
      data: distances,
    },
  });
});

module.exports = {
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
};
