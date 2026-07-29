const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-userId-timestamp.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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
const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// const getAllusers = catchAsync(async (req, res) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'success',
//     res
// ults: users.length,
//     data: {
//       users,
//     },
//   });
// });

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const deleteUser = factory.deleteOne(User);

//update user data
const updateMe = catchAsync(async (req, res, next) => {
  //1. create an error if user POSTS password data
  if (req.body.password || req.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use/updateMyPassword.',
        400,
      ),
    );
  }

  //2 Filtered out unwanted field names thatare not allowed to be updated.
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  //3) Update user documents
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runvalidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

const deleteMe = catchAsync(async (req, res, next) => {
  await user.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });

  //add a query middleware to remove it from list of active users in the usermodel
});

const getAllUsers = factory.getAll(User);
//DO NOT update passwords with this
const updateUser = factory.updateone(User);
const getUser = factory.getOne(User);
module.exports = {
  getAllUsers,
  updateMe,
  deleteMe,
  deleteUser,
  updateUser,
  getUser,
  createUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
