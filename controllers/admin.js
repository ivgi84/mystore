
const Product = require('../models/product');
const fileHelper = require('../utils/file.js');

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
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;

    if(!image){
        return res.status(422).res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            activeAddProduct: true,
            productCSS: true,
            editing: false,
            actionRoute: '/admin/add-product',
            errorMessage: 'Attached file is not an image'
        })
    }

    const imageUrl = image.path;

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
    }).catch(err => {
        console.error(err);
        //res.redirect('/500');
        const error = new Error(err);//important to create error
        error.httpStatusCode = 500;
        return next(error); //in this case all other middlewares will be scipped and move stright to error handling middleware
    }) 

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
    .catch(err => {
        console.error(err);
        const error = new Error(err);//important to create error
        error.httpStatusCode = 500;
        return next(error); //in this case all other middlewares will be scipped and move stright to error handling middleware
    })

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
    const image = req.file;
    const description = req.body.description;

    //first we get object from db, then updating it's data and the call save method which is mongoose method now in order to update product
    Product.findById(prodID).then(product => {
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = title;
        product.price = price;
        product.description = description
        if(image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        return product.save().then(result => {
            console.log('UPDATED PRODUCT')
            res.redirect('/admin/products');
        })
    })
    .catch(err => {
        console.error(err);
        const error = new Error(err);//important to create error
        error.httpStatusCode = 500;
        return next(error); //in this case all other middlewares will be scipped and move stright to error handling middleware
    })
};

exports.deleteProduct = (req, res, next) => {
    console.log('deleteProduct', req.params)
    const prodId = req.params.productID;
    Product.findById(prodId).then(product => {
        if(!product) {
            return next(new Error('Delete product-> product not found'));
        }
        console.log(product);
        fileHelper.deleteFile(product.imageUrl);
        return Product.findOneAndDelete({_id: prodId, userId: req.user._id})
    }).then(product => {
        if(product){
            console.log('Product Deleted');
            res.status(200).json({message: 'Success'});
        }
    })
    .catch(err => {
        res.status(500).json({message: 'Deleting product failed'});
    })
}