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

module.exports = class Product {

    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imgSrc = 'https://picsum.photos/' + Math.floor(Math.random()*1000);
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        return new Promise((resolve, reject) => {
            this.id = Math.floor(Math.random()*10e16).toString();
            getProductsFromFile().then((products) => {
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    if(err){
                        console.log(err);
                        reject(err)
                        return;
                    }
                    console.log('SAVED');
                    resolve(true)
                });
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