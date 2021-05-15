const path = require('path');
const fs = require('fs');

//exports = path.dirname(process.mainModule.filename);


exports.getProductsFromFile = (filePath) => {
  return new Promise((resolve)=> {
      fs.readFile(filePath, (err, content) => {
          if(err){
              return resolve([]);
          }
          resolve(JSON.parse(content));
      });
  });
}

exports.saveProductsToFile = (products, filePath) => {
  return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(products), (err) => {
          if(err) {
              console.log('save file error', err);
              reject(err)
              return;
          }
          resolve(true)
      });
  });
}