const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('shop/index', {
            pageTitle: 'Shop', 
            prods: products, 
            path: '/', 
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true
        })
    }).catch(err => { console.error(err) });
};

exports.getProducts = (req, res, next) => {
    //res.sendFile(path.join(rootDir, 'views', 'shop.html')); //old way
    Product.fetchAll().then(products => {
        res.render('shop/product-list', {
            pageTitle: 'All products', 
            prods: products, 
            path: '/products', 
            hasProducts: products.length > 0,
            activeProducts: true,
            productCSS: true
        })
    }).catch((err) => { console.error(err)});
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then((product) => {
        console.log('getProduct: ', product);
        res.render('shop/product-detail', {
            pageTitle: product.title,
            productCSS: true,
            product: product
        });
    }).catch((err) => console.error(err));    
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(products => {
        //console.log('CART PRODS: ', products)
        res.render('shop/cart', {
            pageTitle: 'Your Cart',
            path: '/cart', 
            activeCart: true,
            products: products,
            hasProducts: products.length > 0
        })    
    })
    .catch(err => console.error(err))
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productID;
    Product.findById(prodId).then(product => {
        return req.user.addToCart(product);
    }).then(result => {
        console.log('Product added to Cart');
        res.redirect('/cart');
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productID;
    req.user.deleteItemFromCart(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.error(err))
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout', 
        path: '/shop/checkout', 
        activeCart: true
    })
};

exports.postOrder = (req, res, next) => {
    req.user.addOrder()
    .then(result => {
        console.log('Order Added');
        res.redirect('/orders');
    })
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
    .then(orders => {
        console.log('orders', orders);
        res.render('shop/orders', {
            pageTitle: 'Your Orders', 
            path: '/shop/orders',
            orders,
            isOrderExists: orders.length > 0,
            activeOrders: true
        })
    }).catch(err => console.error(err))
    
};



