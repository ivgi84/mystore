
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        activeAddProduct: true,
        productCSS: true,
        editing: false,
        actionRoute: '/admin/add-product'
    })
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(null, title, imageUrl,description, price);
    product.save().then(()=>{
        res.redirect('/');
    }); 
};

exports.getAllAdminProducts = (req, res, next) => {
    Product.fetchAll().then((products) => {
        res.render('admin/products', {
            pageTitle: 'Admin - All products', 
            prods: products, 
            path: 'admin/products', 
            hasProducts: products.length > 0,
            activeAdminProducts: true,
            productCSS: true
        })
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if(!editMode) {
        return res.redirect('/');
    }
    const prodID = req.params.productId;
    Product.findById(prodID).then((product) => {
        res.render('admin/edit-product', {
            pageTitle: 'Admin - edit Product', 
            path: 'admin/edit-product',
            product,
            editing: editMode,
            actionRoute: '/admin/edit-product',
            productCSS: true
        });
    }).catch(err => {
        res.redirect('/');
    });
};


exports.postEditProduct = (req, res, next) => {
    const prodID = req.body.productID;
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;

    const udpatedProduct = new Product(prodID, title, imageUrl, description, price);

    udpatedProduct.save();
    res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productID;
    console.log('delete product', prodId);

    Product.deleteById(prodId);
    res.redirect('/admin/products');
}