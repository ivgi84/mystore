const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const expressHbs = require('express-handlebars');
const routeErrorCtrl = require('./controllers/route-error');

const sequelize = require('./utils/db');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

const app = express();

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


app.use(bodyParser.urlencoded({extended: false})); //this will parse post request and the result we'll get in req.body
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    }).catch(err => console.error(err));
});

app.use('/admin',adminRoutes); //url filtering all routes that start from /admin will got to this router and inside router we do not need to mention /admin part
app.use(shopRoutes);

app.use(routeErrorCtrl.eror404);

//db association creation
Product.belongsTo(User, {constraints: true, onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem })

sequelize
.sync({force: true}) //is only for DEVELOPMENT as it will force refresh db setting new accisiations
//.sync()
.then(() => { //sync all models and creates tables if not exists
    User.findByPk(1).then(user => {
        if(!user) {
            return User.create({name: 'Evgeny', email: 'asd@asd.com'})
        }
        return Promise.resolve(user);
    })
    .then(user => {
        //console.log('User', user);
        app.listen(3000, () => {
            console.log('Listening on port 3000');
        }); 
    })
}).catch(err => console.err(err));