const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then((products) => {
        res.render('shop/index', {
            pageTitle: 'Shop', 
            prods: products, 
            path: '/', 
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true
        })
    });
};

exports.getProducts = (req, res, next) => {
    //res.sendFile(path.join(rootDir, 'views', 'shop.html')); //old way
    Product.fetchAll().then((products) => {
        res.render('shop/product-list', {
            pageTitle: 'All products', 
            prods: products, 
            path: '/products', 
            hasProducts: products.length > 0,
            activeProducts: true,
            productCSS: true
        })
    });
};

exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart', 
        activeCart: true
    })
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productID;
    console.log('prodID: ', prodId);
    Product.findById(prodId).then((product) => {
        debugger;
        Cart.addProduct(prodId, product.price);
    });
    res.render('shop/cart', {
        pageTitle: 'Cart'
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout', 
        path: '/shop/checkout', 
        activeCart: true
    })
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders', 
        path: '/shop/orders', 
        activeOrders: true
    })
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then((product) => {
        console.log(product);
        res.render('shop/product-detail', {
            pageTitle: product.title,
            productCSS: true,
            product
        });
    });
};

