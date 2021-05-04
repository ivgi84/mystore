const fs = require('fs');
const path = require('path');

const cartFile  = path.join(
  path.dirname(require.main.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {

  static addProduct(id, productPrice) {
    fs.readFile(cartFile, (err, fileContent) => {
      //fetch previous cart
      let cart = { products: [], totalPrice: 0 };
      if(!err) {
        cart = JSON.parse(fileContent);
      }
      //Analyze the cart => find existing Product
      const existingProductIndex = cart.products.findIndex(product => product.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      //add new product/ increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products]; //making copy of array
        cart.products[existingProductIndex] = updatedProduct; // replacing existing product with new one
      }
      else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [... cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;

      //saving updated file
      fs.writeFile(cartFile, JSON.stringify(cart), err => { 
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(cartFile, (err, fileContent) => {
      
      if(err) {
        console.log('Error deleting data from cart', err);
        return;
      }

      const updatedCart = { ...JSON.parse(fileContent) };

      console.log('updatedCart', updatedCart);

      const product = updatedCart.products.find(product => product.id === id);
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(product => product.id !== id);
      updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

      fs.writeFile(cartFile, JSON.stringify(updatedCart), err => { 
        console.log(err);
      });
    });
  }

}