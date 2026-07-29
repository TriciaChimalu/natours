const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout,
} = require('./../controllers/authController');
const {
  getAllUsers,
  updateMe,
  deleteMe,
  deleteUser,
  getUser,
  getMe,
  createUser,
  updateUser,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('./../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.patch('/resetPassword/:token', resetPassword);
router.post('/forgotPassword', forgotPassword);

router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').delete(deleteUser).get(getUser).patch(updateUser);

module.exports = router;
