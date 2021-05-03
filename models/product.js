const path = require('path');;
const fs = require('fs');

const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'products.json');

const getProductsFromFile = () => {
    return new Promise((resolve)=> {
        fs.readFile(p, (err, content)=> {
            if(err){
                return resolve([])
            }
            resolve(JSON.parse(content))
        });
    });
}

const saveProductsToFile = (products) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(p, JSON.stringify(products), (err) => {
            if(err){
                console.log(err);
                reject(err)
                return;
            }
            resolve(true)
        });
    });
}

module.exports = class Product {

    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imgSrc = imageUrl? imageUrl : 'https://picsum.photos/' + Math.floor(Math.random()*1000);
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        return new Promise((resolve, reject) => {
            
            getProductsFromFile().then((products) => {
                debugger
                if(this.id) {
                    const existingProductIndex = products.findIndex(product => product.id === this.id);
                    const updatedProducts = [...products];
                    updatedProducts[existingProductIndex] = this;

                   saveProductsToFile(updatedProducts).then(() => resolve()).catch(err => reject(err));

                }
                else {
                    this.id = Math.floor(Math.random()*10e16).toString();
                    products.push(this);

                    saveProductsToFile(products).then(() => resolve()).catch(err => reject(err));
                }
            })
        });
    }
    
    static fetchAll() {
        return getProductsFromFile();
    }

    static findById(id) {
        return getProductsFromFile().then((products) => {
            const product = products.find(p => p.id === id);
            return product;
        });
    }

}