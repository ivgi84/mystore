const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
  name:{
    type: String,
    required: false
  },
  password:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart:{
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }]
  }
});


userSchema.methods.addToCart = function(product) {
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
        productId: product._id, 
        quantity: newQuantity
      });
    }

    const updatedCart = { 
      items: updatedCartItems
    };
    
    this.cart = updatedCart;

    return this.save();
}

userSchema.methods.removeFromCart = function(prodId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== prodId.toString();
  });
  this.cart.items = updatedCartItems;

  return this.save();
}

userSchema.methods.clearCart = function(){
  this.cart = { items: []};
  return this.save();
}

module.exports = mongoose.model('User', userSchema);








// const getDb = require('../utils/db').getDb;
// const ObjectId = require('mongodb').ObjectId; 
// class User {
//   constructor(username, email, cart, id){
//     this.username = username;
//     this.email = email;
//     this.cart = cart; // {items: []}
//     this._id = id;
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray();
//   }

// }

// module.exports = User;