
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

    const product = new Product({
        title: title, 
        price: price, 
        description: description, 
        imageUrl: imageUrl,
        userId: req.user// mongoose will take the _id by itself
    });
    product
    .save()//this is mongoose method now
    .then(result => {
        res.redirect('/admin/products');
    }).catch(err => console.error(err)) 

};

exports.getAllAdminProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    // .select('title') //allow to select what data should be retreived from the db
   // .populate('userId','name') // allowes get all data according to property, second param allow to choose what data to get
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

    Product.findById(prodID)
    .then(product => {
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

    //first we get object from db, then updating it's data and the call save method which is mongoose method now in order to update product
    Product.findById(prodID).then(product => {
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = title;
        product.price = price;
        product.description = description
        product.imageUrl = imageUrl;
        return product.save().then(result => {
            console.log('UPDATED PRODUCT')
            res.redirect('/admin/products');
        })
    })
    .catch(err => console.error(err))
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productID;
    //Product.findByIdAndRemove(prodId)
    Product.findOneAndDelete({_id: prodId, userId: req.user._id})
    .then(product => {
        if(product){
            console.log('Product Deleted');
        }
    })
    .catch(err => console.error(err))
    .finally(()=> res.redirect('/admin/products'))
}