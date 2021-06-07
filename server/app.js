const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const PORT = 8080;
const DB_NAME = 'messages';
const MONGODB_URI = `mongodb+srv://ivgi84:admin-ivgi84@cluster0.jsfvu.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;


const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(express.json()); // application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

mongoose.connect(MONGODB_URI, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true 
})
.then(result => {
    app.listen(PORT, () => {
        console.log('Listening on port ' + PORT);
    });
}).catch(err => console.error('Error connecting DB', err));