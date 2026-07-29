const path = require('path');
const fs = require('fs');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('query parser', 'extended');
// app.set('query parser', 'extended');

//Global middlewares

//set security http
// app.use(helmet());

//limit request from ame api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //100 requests in 1hr
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //limiting the amount of data that comes from the body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// //Data Sanititiation against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.cookies);
// });

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
      'ratingAverage',
      'difficulty ',
    ], //an array that we can allow it's duplicate in the query string
  }),
);

// app.use((req, res, next) => {
//   console.log('Hello from the middleware😁');
//   next();
// });

// app.use(express.static(`${__dirname}/public`));
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
// );

// app.get('/api/v1/tours', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

app.use('/', require('./routes/viewRoutes'));
app.use('/api/v1/tours', require('./routes/tourRoutes'));
app.use('/api/v1/users', require('./routes/userRoute'));
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//handling unhandled routes
app.all('*path', (req, res, next) => {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUorl} on this server`,

  //   });
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  //    err.status = 'fail';
  //    err.statusCode = 404

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
