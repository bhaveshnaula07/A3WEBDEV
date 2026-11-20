const express = require('express');
const ctrl = require('../controllers/productController');
const validateId = require('../middleware/validateId');
const validateStockChange = require('../middleware/validateStockChange');

const router = express.Router();

router.route('/').get(ctrl.getProducts).post(ctrl.createProduct);

// Fixed paths MUST be declared before '/:id', otherwise "low-stock" is read as an id
router.get('/low-stock', ctrl.getLowStock);
router.get('/summary', ctrl.getCategorySummary);

router.patch('/:id/stock', validateId, validateStockChange, ctrl.adjustStock);

router
  .route('/:id')
  .get(validateId, ctrl.getProductById)
  .put(validateId, ctrl.updateProduct)
  .delete(validateId, ctrl.deleteProduct);

module.exports = router;
