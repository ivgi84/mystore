const express = require('express');
const adminCtrl = require('../controllers/admin');
const router = express.Router();
const isAuth = require('../middleware/is-auth');


//full url for this is /admin/add-product, => GET request
router.get('/add-product', isAuth, adminCtrl.getAddProduct);

// //full url for this is /admin/add-product, => POST request
router.post('/add-product', isAuth, adminCtrl.postAddProduct);

// //admin/products
router.get('/products', isAuth, adminCtrl.getAllAdminProducts);

router.get('/edit-product/:productId', isAuth, adminCtrl.getEditProduct);

router.post('/edit-product', isAuth, adminCtrl.postEditProduct);

router.post('/delete-product', isAuth, adminCtrl.postDeleteProduct);

module.exports = router;