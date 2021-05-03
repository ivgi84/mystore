const express = require('express');
//const productCtrl = require('../controllers/shop');
const adminCtrl = require('../controllers/admin');
const router = express.Router();

//full url for this is /admin/add-product, => GET request
router.get('/add-product', adminCtrl.getAddProduct);

//full url for this is /admin/add-product, => POST request
router.post('/add-product', adminCtrl.postAddProduct);

//admin/products
router.get('/products', adminCtrl.getAllAdminProducts);

router.get('/edit-product/:productId', adminCtrl.getEditProduct);

router.post('/edit-product', adminCtrl.postEditProduct);

module.exports = router;