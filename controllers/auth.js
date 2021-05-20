const User = require('../models/user');

exports.getlogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'User Page', 
    path: '/login',
    activeLogin: true,
    loginCSS: true,
    isLoggedIn: req.session.isLoggedIn
  })
};


exports.postLogin = (req, res, next) => {
  User.findById('60a41b1a6502af339cd6cfcf').then(user => {
    req.session.isLoggedIn = true;
    req.session.user = user;//mogoose object here
    req.session.save(()=> { //we do save in order to verify that session was created before we redirect to /
      res.redirect('/');
    });
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