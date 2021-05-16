const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
    Product.findAll({raw: true}).then(products => {
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
    Product.findAll({raw: true}).then(products => {
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
    //****alternative approach
    //Product.findAll({where: {id: prodId}}).then(products).catch()//result here is an array
    //alternative approach ******
    
    Product.findByPk(prodId).then((product) => {
        res.render('shop/product-detail', {
            pageTitle: product.title,
            productCSS: true,
            product: product
        });
    }).catch((err) => console.error(err));    
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(cart => {
        return cart.getProducts()
            .then(products => {
                res.render('shop/cart', {
                    pageTitle: 'Your Cart',
                    path: '/cart', 
                    activeCart: true,
                    products: products,
                    hasProducts: products.length > 0
                })
            }).catch(err => console.error(err));
    })
    .catch(err => console.error(err))
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productID;
    let fetchedCard;
    let newQuantity = 1;

    req.user.getCart() //getting Cart
    .then(cart => {
        fetchedCard = cart;
        return cart.getProducts({where: {id: prodId}}); //getting products in this cart
    })
    .then(products => {
        let product;
        if(products.length > 0) { 
            product = products[0];
        }
        if(product) { //if we found product in this cart adding qty
            const oldQty = product.cartItem.quantity;
            newQuantity = oldQty + 1;
            return product;
        }
        return Product.findByPk(prodId)
    })
    .then(product => { //adding or updating qty product in cart
        return fetchedCard.addProduct(product, {
            through: {quantity: newQuantity}
        });
    })
    .then(() => res.redirect('/cart'))
    .catch(err => console.error(err))
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productID;
    req.user.getCart()
    .then(cart => { //got cart
        return cart.getProducts( {where: { id: prodId } });//getting product in this cart by ID
    })
    .then(products => {//got product
        const product = products[0];
        return product.cartItem.destroy(); //remov product from cart
    })
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
    let fetchedCard;
    req.user.getCart().then(cart => {
        fetchedCard = cart;
        return cart.getProducts();
    }).then(products => {
        return req.user.createOrder().then(order => {
            return order.addProducts(products.map(product => {
                product.orderItem = { quantity: product.cartItem.quantity }
                return product;
            }));
        })
        .catch(err=> console.error(err))
    })
    .then(result => {
        fetchedCard.setProducts(null);
        res.redirect('/orders');
    })
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
    .then(orders => {
        console.log('orders', orders[0]);
        res.render('shop/orders', {
            pageTitle: 'Your Orders', 
            path: '/shop/orders',
            orders,
            isOrderExists: orders.length > 0,
            activeOrders: true
        })
    }).catch(err => console.error(err))
    
};



