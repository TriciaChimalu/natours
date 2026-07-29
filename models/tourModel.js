const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel')

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      trim: true,
      maxlength: [40, 'A tour name must have more or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      requird: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy,medium or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //to return an average
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
      //custom validation
      validate: {
        validator: function (val) {
          //this only points to current doc on NEW document cr
          return val < this.price; //100 < 200
        },
        message: 'Discount should ({VALUE}) be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //long,lat
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: true,
  },
);

// tourSchema.index({ price: 1 });

tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //if the data describes two points on the earth like sphere

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
}); // doesn't save to the database but can be used in the code or seen

//virtial populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //name of the field in the
  localField: '_id',
});

// Document middlewae:runs before .save() and .create()
tourSchema.pre('save', async function () {
  this.slug = slugify(this.name, { lower: true });
});

/***Embedding tour guide */
// tourSchema.pre('save',async function(){
//   const guidesPromises = this.guides.map(async id => User.findById(id));
//   this.guides = await Promise.all(guidesPromises)
// })
/**** */

// tourSchema.post('save', function (docs,next) {
//   console.log(docs);
//   next();
// });

// query middleware
tourSchema.pre(/^find/, async function () {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
});
tourSchema.pre('find', async function () {
  this.find({ secretTour: { $ne: true } });
});

//trick incase you want to populate all your documents
tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
});

// post middleware
// tourSchema.post(/^find/, function (docs) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);

//   console.log(docs);
// });

// aggregate middleware
// tourSchema.pre('aggregate', async function () {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
// });

const Tour = mongoose.model('Tour', tourSchema);

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => console.log('ERROR:', err));

module.exports = Tour;
