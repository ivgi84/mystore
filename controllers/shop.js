const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');


exports.getIndex = (req, res, next) => {
    Product.find() //mongoose method
    .then(products => {
        res.render('shop/index', {
            pageTitle: 'Shop',
            prods: products,
            path: '/',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true,
            csrfToken: req.csrfToken()
        })
    }).catch(err => { console.error(err) });
};

exports.getProducts = (req, res, next) => {
    //res.sendFile(path.join(rootDir, 'views', 'shop.html')); //old way
    // ***** find() is a mongoose method now, that will return all products.
    // but we still can use cursor in orde to fetch data with pagination, use: find().cursor() ******
    Product.find()
    .then(products => {
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
    Product.findById(prodId) // now its mongoose method
    .then((product) => {
        console.log('getProduct: ', product);
        res.render('shop/product-detail', {
            pageTitle: product.title,
            productCSS: true,
            product: product
        });
    }).catch((err) => console.error(err));
};

exports.getCart = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        //console.log('CART PRODS: ', products)
        const products = user.cart.items;
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
    req.user.removeFromCart(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.error(err))
};

exports.postOrder = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items.map(i => {
            return {
                quantity: i.quantity,
                product: { ...i.productId._doc }
            }
        });

        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        });
        return order.save();
    })
    .then(result => {
        console.log('Order Added');
        return req.user.clearCart()
    }).then(() => {
        res.redirect('/orders');
    })
};

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
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

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/shop/checkout',
        activeCart: true
    })
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    let totalPrice = 0;
    Order.findById(orderId).then(order => {
        if(!order){
            return next(new Error('No order found'));
        }
        if(order.user.userId.toString() !== req.user._id.toString()){
            return next(new Error('Unauthorized'));
        }
        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data','invoices',invoiceName);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', { underline: true });
        pdfDoc.fontSize(16);
        pdfDoc.text('---------------------------------------');
        order.products.forEach(prod => {
            totalPrice = totalPrice + prod.quantity * prod.product.price;
            pdfDoc.text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
        });
        pdfDoc.text('------');
        pdfDoc.fontSize(20).text(`Total price:  $${totalPrice}`);

        pdfDoc.end();

        //fs.readFile and return data can work well for small files only
        // fs.readFile(invoicePath,(err, data) => {
        //     if(err){
        //         console.log('download file error', err);
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type', 'application/pdf');
        //     res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');
        //     console.log('headers: ',res.headers)
        //     res.send(data);
        // });
        // if we have large file we should stream data
        // const file = fs.createReadStream(invoicePath);
        // file.pipe(res);
    })
    .catch(err => {next(err)})
}


