const express = require('express');
const path = require('path');
//const bodyParser = require('body-parser'); // bodyparser is depricated, use express.urlencoded instead
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const expressHbs = require('express-handlebars');
const routeErrorCtrl = require('./controllers/route-error');

const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://ivgi84:admin-ivgi84@cluster0.jsfvu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const app = express();
const sessionStore = new MongoDBSession({ //we use mongodb to store all sessions
    uri: MONGODB_URI,
    collection: 'sessions',
});

const csrfProtection = csrf();

app.engine('hbs', expressHbs({
    extname: 'hbs',
    defaultLayout: 'main-layout',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials', // partials is a default folder, but writing it to be explicetly configured
    runtimeOptions: {
        allowProtoPropertiesByDefault: true // allow to access parent properties
    }
})); //we need to say to express that this is the engine

const fileStorage = multer.diskStorage({ //here we configure how multer will proccess file that we upload
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    console.log(file)
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        console.log('TRUE')
        cb(null, true)
    } else {
        console.log('FALSE')
        cb(null, false);
    }
};

app.set('view engine','hbs') //configure a template engine
app.set('views', 'views') //by default views prop goes to views folder, but here it configured explicitly

const adminRoutes = require('./router/admin');
const shopRoutes = require('./router/shop');
const authRoutes = require('./router/auth');

app.use(express.urlencoded({extended: false})); //this will parse post request and the result we'll get in req.body
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'));// cause we're going to upload only one file with name image
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: 'my secret', //secret in prod it should long string value
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

app.use(csrfProtection);
app.use(flash()); //messages

app.use((req, res, next) => {
    //res.locals are vars that are passed to views which are rendered
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    console.log("LOCALS", res.locals);
    next();
})

app.use((req, res, next) => {
    if(!req.session.user) { return next() }
    User.findById(req.session.user._id).then(user => {
        if(!user){
            return next();
        }
        req.user = user;
        next();
    }).catch(err => {
        next(new Error(err))//inside async block we should use next(Error) so error handling middleware will catch it
        // throw new Error(err); !!inside async block the error handling middlware will not work

    });
});


app.use('/admin',adminRoutes); //url filtering all routes that start from /admin will got to this router and inside router we do not need to mention /admin part
app.use(shopRoutes);
app.use(authRoutes);


app.get('/500', routeErrorCtrl.error500);
app.use(routeErrorCtrl.eror404);

//special error handling middleware that get 4 params. the first param is the error
//expample in admin controller in createNewProduct
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path:'/500',
        isLoggedIn: req.session.isLoggedIn,
        content: error
    })
});

mongoose.connect(MONGODB_URI, { useUnifiedTopology: true })
.then(result => {
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
}).catch(err => console.error('Error connecting DB', err));

