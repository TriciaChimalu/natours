class APIFeaturs {
  constructor(query, queryString) {
    this.query = this.query;
    this.queryStr = this.queryStr;
  }
  filter() {
    const queryObj = { ...this.queryStr };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(queryStr);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');

      this.query = query.sort(sortBy);
    } else {
      this.query = query.sort('-createdAt');
    }
    return this;
  }
  limit() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = req.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // if (this.queryStr.page) {
    //   const numTour = await Tour.countDocuments();
    //   if (skip >= numTour) throw new Error('This page does not exist');
    // }
    return this;
  }
}
