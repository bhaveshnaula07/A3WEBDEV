const Product = require('../models/Product');

const ALLOWED_FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];

const pickFields = (body) => {
  const data = {};
  ALLOWED_FIELDS.forEach((f) => {
    if (body[f] !== undefined) data[f] = body[f];
  });
  return data;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const notFoundError = () => {
  const err = new Error('Product not found');
  err.statusCode = 404;
  return err;
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(pickFields(req.body));
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// GET /api/products
// Query: category, supplier, search, minPrice, maxPrice, inStock, sort, page, limit
exports.getProducts = async (req, res, next) => {
  try {
    const { category, supplier, search, minPrice, maxPrice, inStock, sort } = req.query;

    // ---- Filtering ----
    const filter = {};
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    if (supplier) filter.supplier = new RegExp(escapeRegex(supplier), 'i');
    if (search) filter.name = new RegExp(escapeRegex(search), 'i');

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    if (inStock === 'true') filter.quantity = { $gt: 0 };
    if (inStock === 'false') filter.quantity = 0;

    // ---- Sorting: ?sort=-price,name ----
    const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';

    // ---- Pagination ----
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortBy).skip(skip).limit(limit),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw notFoundError();
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, pickFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) throw notFoundError();
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/stock   body: { "change": 10 } or { "change": -3 }
// Positive = restock, negative = sale. Done atomically with $inc so concurrent
// sales can never push the quantity below zero.
exports.adjustStock = async (req, res, next) => {
  try {
    const { change } = req.body;
    const filter = { _id: req.params.id };
    if (change < 0) filter.quantity = { $gte: Math.abs(change) };

    const product = await Product.findOneAndUpdate(
      filter,
      { $inc: { quantity: change } },
      { new: true }
    );

    if (!product) {
      const exists = await Product.exists({ _id: req.params.id });
      if (!exists) throw notFoundError();
      const err = new Error('Insufficient stock for this sale');
      err.statusCode = 400;
      throw err;
    }

    res.status(200).json({ message: 'Stock updated', product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw notFoundError();
    res.status(200).json({ message: 'Product deleted', id: product.id });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/low-stock   (quantity <= reorderLevel) - aggregation
exports.getLowStock = async (req, res, next) => {
  try {
    const lowStockItems = await Product.aggregate([
      { $match: { $expr: { $lte: ['$quantity', '$reorderLevel'] } } },
      { $addFields: { stockValue: { $multiply: ['$price', '$quantity'] }, id: { $toString: '$_id' } } },
      { $sort: { quantity: 1 } },
    ]);
    res.status(200).json({ count: lowStockItems.length, lowStockItems });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/summary   category-wise inventory summary - aggregation
exports.getCategorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          avgPrice: { $avg: '$price' },
        },
      },
      { $sort: { totalStockValue: -1 } },
    ]);
    res.status(200).json({ categories: summary.length, summary });
  } catch (err) {
    next(err);
  }
};
