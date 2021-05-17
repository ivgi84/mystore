const getDb = require('../utils/db').getDb;
const ObjectId = require('mongodb').ObjectId; 



class Product {
    constructor(title, price, description, imageUrl, id, userId){
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new ObjectId(id): null;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        let dbOp;
        if(this._id){
            dbOp = db.collection('products').updateOne({_id: ObjectId(this._id)}, {$set: this});
        }
        else{
            dbOp = db.collection('products').insertOne(this);
        }
        return dbOp.then(result => {
            console.log(result);
        })
        .catch(err => console.error(err))
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray()
        .then(products => {
            console.log(products);
            return products;
        }).catch(err => console.error(err))
    }

    static findById(prodId) {
        const db = getDb();
        var o_id = new ObjectId(prodId);
        return db.collection('products').find({_id: o_id})
        .next()
        .then(product => {
            console.log('FindByID:', product);
            return product;
        })
        .catch(err => console.error(err))
    }

    static deleteById(id) {
        const db = getDb();
        return db.collection('products').deleteOne({_id: ObjectId(id)})
        .catch(err => console.error(err))
    }
}

module.exports = Product;