const fs = require('fs');
const path = require('path');

const p  = path.join(
  path.dirname(require.main.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
  static getAddProduct(id) {

    fs.readFile(p, (err, fileContent) => {
      //fetch previous cart
      let cart = {products: [], totalPrice: 0 };
      if(!cart){
        cart = JSON.parse(fileContent);
      }
      //Analyze the cart => find existing Product
      const existingProduct = cart.products.find(product => product.id === id);
      let updatedProduct;
      if(existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty  + 1;
      }
    });
  }
}