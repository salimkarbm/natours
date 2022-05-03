class ApiFeatures {
  constructor(dbQuery, reqQuery) {
    this.dbQuery = dbQuery;
    this.reqQuery = reqQuery;
  }

  filter() {
    // filtering
    const queryObj = { ...this.reqQuery };
    const excludeValues = ['limit', 'page', 'fields', 'sort'];
    excludeValues.forEach((el) => delete queryObj[el]);

    // advance filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.dbQuery.find(JSON.parse(queryString));
    return this;
  }

  // sorting
  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.dbQuery = this.dbQuery.sort(sortBy);
    } else {
      this.dbQuery = this.dbQuery.sort('-createdAt');
    }
    return this;
  }

  limit() {
    // field limiting or projecting
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.dbQuery = this.dbQuery.select(fields);
    } else {
      this.dbQuery = this.dbQuery.select('-__v');
    }
    return this;
  }

  paginate() {
    // pagination
    const page = parseInt(this.reqQuery.page, 10) || 1;
    const limit = parseInt(this.reqQuery.limit, 10) || 100;
    const skip = (page - 1) * limit;

    this.dbQuery = this.dbQuery.skip(skip).limit(limit);
    return this;
  }
}
module.exports = ApiFeatures;
