const fs = require('fs');
const path = require('path');

const p  = path.join(
  path.dirname(require.main.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
  static addProduct(id, productPrice) {

    fs.readFile(p, (err, fileContent) => {
      //fetch previous cart
      debugger;
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
      fs.writeFile(p, JSON.stringify(cart), err => { 
        console.log(err);
      });
    });
  }
}