const mongoose = require('mongoose');

// Rejects requests whose :id param is not a valid MongoDB ObjectId
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error(`Invalid product id: ${req.params.id}`);
    err.statusCode = 400;
    return next(err);
  }
  next();
};

module.exports = validateId;
