const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');



const feedRoutes = require('./routes/feed');

const PORT = 8080;
const DB_NAME = 'messages';
const MONGODB_URI = `mongodb+srv://ivgi84:admin-ivgi84@cluster0.jsfvu.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;


const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4())
    }
});

const fileFilter = (req, file, cb) => {
    if( file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'){
            cb(null, true)
    }
    else{
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(express.json()); // application/json
app.use(multer({
    storage,
    fileFilter
}).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next)=>{
    console.error(error);
    const status = error.statusCode;
    const message = error.message;
    res.status(status).json({message})
});


mongoose.connect(MONGODB_URI, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true 
})
.then(result => {
    app.listen(PORT, () => {
        console.log('Listening on port ' + PORT);
    });
}).catch(err => console.error('Error connecting DB', err));