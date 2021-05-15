const path = require('path');;
const utils = require('../utils/helper');

const Cart = require('./cart');

const productsFile = path.join(
    path.dirname(require.main.filename),
    'data',
    'products.json');

module.exports = class Product {

    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imgSrc = imageUrl? imageUrl : 'https://picsum.photos/' + Math.floor(Math.random()*1000);
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    static fetchAll() {
        return utils.getProductsFromFile(productsFile);
    }

    static findById(id) {
        return utils.getProductsFromFile(productsFile).then((products) => {
            const product = products.find(p => p.id === id);
            return product;
        });
    }

    static deleteById(id) {
        return utils.getProductsFromFile(productsFile).then((products) => {
            const product = products.find(prod => prod.id === id);
            const updatedProducts = products.filter(product => product.id !== id);
            return utils.saveProductsToFile(updatedProducts, productsFile).then(() => {
                Cart.deleteProduct(id, product.price);
            });

        });
    }

    save() {
        return new Promise((resolve, reject) => {
            
            utils.getProductsFromFile(productsFile).then((products) => {
                if(this.id) {
                    const existingProductIndex = products.findIndex(product => product.id === this.id);
                    const updatedProducts = [...products];
                    updatedProducts[existingProductIndex] = this;

                    utils.saveProductsToFile(updatedProducts, productsFile).then(() => resolve()).catch(err => reject(err));

                }
                else {
                    this.id = Math.floor(Math.random()*10e16).toString();
                    products.push(this);

                    utils.saveProductsToFile(products, productsFile).then(() => resolve()).catch(err => reject(err));
                }
            })
        });
    }
    
 

}