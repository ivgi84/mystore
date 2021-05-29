const User = require('../models/user');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var transporterOptions = {
  auth: {
      api_user: 'ivgi84.activehosted.com',
      api_key: 'issue01'
  }
}
const transporter = nodemailer.createTransport(sgTransport(transporterOptions));

exports.getSignUp = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'User Sign Up',
    path:'signup',
    activeSignup: true,
    loginCSS: true,
  })
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const repeatPassword = req.body.repeatPassword;
  User.findOne({email}).then(userData => {
    if(userData){ 
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12) // 12 is the level of encription
    .then(hashedPass => {
      const user = new User({
        email,
        password: hashedPass,
        cart: { itmes: []}
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      transporter.sendMail({
        to: email,
        from: 'shop@my.com',
        subject: 'Signing up succeeded',
        html:'<h1>You signed up to my shop</h1>'
      }).catch(err => console.error(err))
    })
  })
  .catch(err => console.error(err))
};

exports.getlogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'User Page', 
    path: '/login',
    activeLogin: true,
    loginCSS: true,
    errorMessage: req.flash('error')
  })
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email}).then(user => {
    if(!user){ 
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    bcrypt.compare(password, user.password)
    .then((match) =>{
      if(match){
        req.session.isLoggedIn = true;
        req.session.user = user; //mogoose object here
        return req.session.save(()=> { //we do save in order to verify that session was created before we redirect to /
          res.redirect('/');
        });
      }
      else{
        res.redirect('/login');
      }
    })
    .catch(err => { console.error(err); res.redirect('/login')})
  }).catch(err => console.error(err));
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if(err){
      console.error(err);
    }
    res.redirect('/');
  });
}