// Validates the body of PATCH /api/products/:id/stock
const validateStockChange = (req, res, next) => {
  const { change } = req.body || {};

  if (change === undefined || change === null) {
    const err = new Error('"change" is required (positive to restock, negative to sell)');
    err.statusCode = 400;
    return next(err);
  }
  if (typeof change !== 'number' || !Number.isInteger(change) || change === 0) {
    const err = new Error('"change" must be a non-zero whole number');
    err.statusCode = 400;
    return next(err);
  }
  next();
};

module.exports = validateStockChange;
