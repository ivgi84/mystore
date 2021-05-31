const crypto = require('crypto'); //buildin lib to encrypt values
const User = require('../models/user');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var transporterOptions = {
  auth: {
      api_key: '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'
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
        from: 'ivgi84@gmail.com',
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
};

exports.getResetPassword = (req, res, next) => {
  res.render('auth/resetPassword', {
    pageTitle: 'Reset Password', 
    path: '/reset',
    activeResetPassword: true,
    loginCSS: true,
  })
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32,(err, buffer) => {
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({
      email: req.body.email
    }).then(user => {
      if(!user){ 
        console.log('error', 'No Account found');
        return req.flash('error', 'No Account found');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000 //one hour
      return user.save();
    }).then(result => {
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'ivgi84@gmail.com',
        subject: 'Password reset',
        html:`
          <h2>You requested password reset</h2>
          <p>Click <a href="http://localhost:3000/reset/${token}">here</a> to reset your password</p>
        `
      }).catch(err => console.error(err))
    })
    .catch(err => console.error(err));
  })
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() } //  $gt is operator greater in mongo
  }).then(user => {
    if(!user){ 
      console.log('No User found')
      return null;
    }
    res.render('auth/newPassword', {
      pageTitle: 'New Password', 
      path: '/new-password',
      activeNewPassword: true,
      loginCSS: true,
      userId:user._id.toString(),
      passwordToken: token
    })
  }).catch(err => {console.error(err)})
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now()},
    _id: userId
  }).then(user => {
    if(user) { 
      resetUser = user;
      return bcrypt.hash(newPassword, 12)
    }
  }).then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  }).then(result => {
    console.log('Password reset');
    res.redirect('/login');
  })
  .catch(err => {console.error(err)})

};