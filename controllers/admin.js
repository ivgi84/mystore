
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        activeAddProduct: true,
        productCSS: true
    })
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, imageUrl,description, price);
    debugger;
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
            activeAdminProducts: true
        })
    });
};

// exports.editProduct = (req, res, next) => {
//     res.render('admin/edit-product', {
//         pageTitle: 'Admin - edit Product', 
//         path: 'admin/edit-product'
//     })
// }