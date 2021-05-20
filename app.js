const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);

const expressHbs = require('express-handlebars');
const routeErrorCtrl = require('./controllers/route-error');

const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://ivgi84:admin-ivgi84@cluster0.jsfvu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const app = express();
const sessionStore = new MongoDBSession({ //we use mongodb to store all sessions
    uri: MONGODB_URI,
    collection: 'sessions',
});

app.engine('hbs', expressHbs({
    extname: 'hbs',
    defaultLayout: 'main-layout',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials', // partials is a default folder, but writing it to be explicetly configured
    runtimeOptions: {
        allowProtoPropertiesByDefault: true // allow to access parent properties
    }
})); //we need to say to express that this is the engine
app.set('view engine','hbs') //configure a template engine 
app.set('views', 'views') //by default views prop goes to views folder, but here it configured explicitly

const adminRoutes = require('./router/admin');
const shopRoutes = require('./router/shop');
const authRoutes = require('./router/auth');


app.use(bodyParser.urlencoded({extended: false})); //this will parse post request and the result we'll get in req.body
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret', //secret in prod it should long string value
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

app.use((req, res, next) => {
    if(!req.session.user) { return next() }
    User.findById(req.session.user._id).then(user => {
        req.user = user;
        next();
    }).catch(err => console.error(err));
});

app.use('/admin',adminRoutes); //url filtering all routes that start from /admin will got to this router and inside router we do not need to mention /admin part
app.use(shopRoutes);
app.use(authRoutes);

app.use(routeErrorCtrl.eror404);

mongoose.connect(MONGODB_URI, { useUnifiedTopology: true })
.then(result => {
    app.listen(3000, () => {
        if(User.findOne().then(user => {
            if(!user) {
                const user = new User({
                    name: 'ivgi',
                    email: 'ivgi@mail.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        }));
        console.log('Listening on port 3000');
    }); 
}).catch(err => console.error('Error connecting DB', err));

