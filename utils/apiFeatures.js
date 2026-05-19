/**
 * Build a Mongoose query object from URL query params for product filtering.
 */
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // ─── Text Search ────────────────────────────────────────────────────────────
  search() {
    if (this.queryStr.keyword) {
      this.query = this.query.find({
        $text: { $search: this.queryStr.keyword },
      });
    }
    return this;
  }

  // ─── Filter ─────────────────────────────────────────────────────────────────
  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((f) => delete queryObj[f]);

    // Convert to MongoDB comparison operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (m) => `$${m}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // ─── Sort ───────────────────────────────────────────────────────────────────
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // ─── Field Limiting ──────────────────────────────────────────────────────────
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // ─── Pagination ──────────────────────────────────────────────────────────────
  paginate() {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 12;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = ApiFeatures;
