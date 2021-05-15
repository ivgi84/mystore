const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then(([rows, fieldData]) => {
        res.render('shop/index', {
            pageTitle: 'Shop', 
            prods: rows, 
            path: '/', 
            hasProducts: rows.length > 0,
            activeShop: true,
            productCSS: true
        })
    }).catch((err) => { console.error(err)});;
};

exports.getProducts = (req, res, next) => {
    //res.sendFile(path.join(rootDir, 'views', 'shop.html')); //old way
    Product.fetchAll().then(([rows, fieldData]) => { // distraction
        res.render('shop/product-list', {
            pageTitle: 'All products', 
            prods: rows, 
            path: '/products', 
            hasProducts: rows.length > 0,
            activeProducts: true,
            productCSS: true
        })
    }).catch((err) => { console.error(err)});
};

exports.getCart = (req, res, next) => {
    Cart.getCart().then((cart) => {
        Product.fetchAll().then((products) => {
            const cartProducts = [];
            for(product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if(cartProductData) {
                    cartProducts.push({product: product, qty: cartProductData.qty})
                }
                console.log('cartProducts', cartProducts)
            }
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart', 
                activeCart: true,
                products: cartProducts,
                hasProducts: cartProducts.length > 0
            })
        })
    });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productID;
    console.log('prodID: ', prodId);
    Product.findById(prodId).then((product) => {
        Cart.addProduct(prodId, product.price).then((isSaved) => {
            console.log('After Cart saved, rendering cart');
            res.redirect('/cart');
        });
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const productID = req.body.productID;
    Product.findById(productID).then((product) => {
        Cart.deleteProduct(product.id, product.price).then((isSaved) => {
            res.redirect('/cart');
        })
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
    Product.findById(prodId).then(([product]) => {
        console.log(product);
        res.render('shop/product-detail', {
            pageTitle: product.title,
            productCSS: true,
            product: product[0]
        });
    }).catch((err) => console.error(err));
      
};

