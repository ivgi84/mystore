
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

    //createProduct method that was created dynamycly, because we associated user with product
    req.user.createProduct({ 
        title,
        price,
        imageUrl,
        description
    }).then(result => {
        res.redirect('/admin/products');
    }).catch(err => console.error(err)) 

    // another option of doing the same
    // Product.create({ //create and saves the new object ot db
    //     title,
    //     price,
    //     imageUrl,
    //     description,
    //     UserId: req.user.id //adding userID as we need it for association
    // }).then(result => {
    //     res.redirect('/admin/products');
    // }).catch(err => console.error(err)) 
};

exports.getAllAdminProducts = (req, res, next) => {

    //usage of model to get associated data
    req.user.getProducts()
    .then(products => {
        res.render('admin/products', {
            pageTitle: 'Admin - All products', 
            prods: products, 
            path: 'admin/products', 
            hasProducts: products.length > 0,
            activeAdminProducts: true,
            productCSS: true
        })
    })
    .catch(e => console.error(e));

    //use regular way
    //Product.findAll().then(products => {})
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if(!editMode) {
        return res.redirect('/');
    }
    const prodID = req.params.productId;

    //usage of model to get it's associated data
    req.user.getProducts({where: {id: prodID}}).then(products => {
        const product = products[0];
        if(!product){
            res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Admin - edit Product', 
            path: 'admin/edit-product',
            product: product,
            editing: editMode,
            actionRoute: '/admin/edit-product',
            productCSS: true
        });
    }).catch(err => {
        res.redirect('/');
    });

    // Product.findByPk(prodID).then(product => {}) using regular model to get data
};

exports.postEditProduct = (req, res, next) => {
    const prodID = req.body.productID;
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;

    Product.findByPk(prodID).then(product => {
        product.title = title;
        product.price = price;
        product.imageUrl = imageUrl;
        product.description = description;
        return product.save();
    })
    .then(result => console.log('UPDATED PRODUCT'))
    .catch(err => console.error(err))
    .finally(()=> {
        res.redirect('/admin/products');
    })
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productID;
    Product.findByPk(prodId).then(product => {
        return product.destroy(); //delte item
    })
    .then(result => console.log('Product Deleted'))
    .catch(err => console.error(err))
    .finally(()=> res.redirect('/admin/products'))
}