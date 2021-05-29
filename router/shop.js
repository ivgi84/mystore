const express = require('express');
const shopCtrl = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');


const router = express.Router();

router.get('/', shopCtrl.getIndex);

router.get('/products', shopCtrl.getProducts);

router.get('/products/:productId', isAuth, shopCtrl.getProduct);

router.get('/cart', isAuth, shopCtrl.getCart);

router.post('/cart', isAuth, shopCtrl.postCart);

router.post('/cart-delete-item', isAuth, shopCtrl.postCartDeleteProduct);

router.get('/orders', isAuth, shopCtrl.getOrders);

router.post('/create-order', isAuth, shopCtrl.postOrder);

// router.get('/checkout', shopCtrl.getCheckout);


module.exports = router;