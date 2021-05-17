const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
  MongoClient.connect('mongodb+srv://ivgi84:admin-ivgi84@cluster0.jsfvu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true })
  .then(client => {
    console.log('MongoDB connection success');
    _db = client.db();
    cb();
  })
  .catch(err => { 
    console.error('Error connecting to DB: ',err);
    throw err;
  })
}

const getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'No Database found';
}



exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

