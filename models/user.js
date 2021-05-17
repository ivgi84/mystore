const getDb = require('../utils/db').getDb;
const ObjectId = require('mongodb').ObjectId; 
class User {
  constructor(username, email, cart, id){
    this.username = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users')
    .insertOne(this)
    .then(result => console.log('User Added'))
    .catch(err => console.error(err))
  }

  addToCart(product) {
    const db = getDb();
    let newQuantity = 1;

    const cartProductIndex = this.cart.items.findIndex(cp => { //if found, means product exists in cart
      return cp.productId.toString() === product._id.toString();
    });
    
    const updatedCartItems = [...this.cart.items];

    if(cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else{
      updatedCartItems.push({
        productId: new ObjectId(product._id), quantity: newQuantity
      });
    }

    const updatedCart = { 
      items: updatedCartItems
    };
    

    //following code will update only the cart of the user
    return db.collection('users').updateOne(
      { _id: new ObjectId(this._id) },
      { $set: { cart: updatedCart } }
    )

  }

  static findById(id) {
    const db = getDb();
    const o_id = new ObjectId(id);
    return db.collection('users').findOne({ _id: o_id} )
    .catch(err => console.error(err));
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(i => {
      return i.productId;
    });
    return db.collection('products')
    .find(({ _id: {$in: productIds }}))
    .toArray()
    .then(products => {
      return products.map(p => {
        return {
          ...p,
          quantity: this.cart.items.find(i => {
            return i.productId.toString() === p._id.toString()
          }).quantity
        };
      });
    });
  }

  deleteItemFromCart(prodId) {
    const db = getDb();

    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== prodId.toString();
    });

    return db.collection('users').updateOne(
      { _id: new ObjectId(this._id) },
      { $set: { cart: { items: updatedCartItems }}}
    )
  }

  addOrder() {
    const db = getDb();
    return this.getCart().then(products => {
      const order = {
        items: products,
        user: {
          _id: new ObjectId(this._id),
          username: this.username
        }
      };
      return db.collection('orders').insertOne(order);
    })
    .then(result => {
      this.cart = { items: [] };
      return db.collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: [] }} }
      )
    });
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray();
  }

}

module.exports = User;