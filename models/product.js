const Cart = require('./cart');

const db = require('../utils/db');
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
        return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ? ', [id])
    }

    static deleteById(id) {
        
    }

    save() {
        return db.execute('INSERT INTO products (title, price, imageURL, description) VALUES(?, ?, ?, ?)', 
        [this.title, this.price, this.imageUrl, this.description]);
    }
    
 

}