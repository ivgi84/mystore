const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const expressHbs = require('express-handlebars');
const routeErrorCtrl = require('./controllers/route-error');

const db = require('./utils/db');

const app = express();

app.engine('hbs', expressHbs({
    extname: 'hbs',
    defaultLayout: 'main-layout',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials' // partials is a default folder, but writing it to be explicetly configured
})); //we need to say to express that this is the engine
app.set('view engine','hbs') //configure a template engine 
app.set('views', 'views') //by default views prop goes to views folder, but here it configured explicitly

const adminRoutes = require('./router/admin');
const shopRoutes = require('./router/shop');

//example
// db.execute('SELECT * FROM products').then((data) => {
//     console.log(data[0]);
// })

app.use(bodyParser.urlencoded({extended: false})); //this will parse post request and the result we'll get in req.body
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin',adminRoutes); //url filtering all routes that start from /admin will got to this router and inside router we do not need to mention /admin part
app.use(shopRoutes);

app.use(routeErrorCtrl.eror404);


app.listen(3000, () => {
    console.log('Listening on port 3000');
}); 