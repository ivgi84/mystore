const crypto = require('crypto'); //buildin lib to encrypt values
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

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
    oldInput: {
      email: '', 
      password:'',
      repeatPassword: ''
    },
    validationErrors:[]
  })
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      pageTitle: 'User Sign Up',
      path:'signup',
      activeSignup: true,
      loginCSS: true,
      errorMessage: errors.array()[0] && errors.array()[0].msg,
      oldInput: {
        email, 
        password,
        repeatPassword: req.body.repeatPassword
      },
      validationErrors: errors.array()
    })
  }

  //email validation happens as middleware in route
  bcrypt.hash(password, 12) // 12 is the level of encription
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
    .catch(err => {
      const error = new Error(err);//important to create error
      error.httpStatusCode = 500;
      return next(error); //in this case all other middlewares will be scipped and move stright to error handling middleware
  })
};

exports.getlogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'User Page', 
    path: '/login',
    activeLogin: true,
    loginCSS: true,
    errorMessage: req.flash('error'),
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors:[]
  })
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  //checking errors we might got durtin validation
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log('Errors in validation');
    return res.status(422).render('auth/login', {
      pageTitle: 'User Page', 
      path: '/login',
      activeLogin: true,
      loginCSS: true,
      errorMessage: errors.array()[0] && errors.array()[0].msg,
      oldInput: {
        email,
        password
      },
      validationErrors:[]
    })
  }

  User.findOne({email}).then(user => {
    if(!user){ 
      console.log('user not found')
      return res.status(422).render('auth/login', {
        pageTitle: 'User Page', 
        path: '/login',
        activeLogin: true,
        loginCSS: true,
        errorMessage: errors.array()[0] && errors.array()[0].msg,
        oldInput: {
          email,
          password
        },
        validationErrors:[]
      })
    }
    bcrypt.compare(password, user.password)
    .then((match) =>{
      if(match){
        console.log('Logged In')
        req.session.isLoggedIn = true;
        req.session.user = user; //mogoose object here
        return req.session.save(()=> { //we do save in order to verify that session was created before we redirect to /
          res.redirect('/');
        });
      }
      else{
        console.log('Password not match')
        return res.status(422).render('auth/login', {
          pageTitle: 'User Page', 
          path: '/login',
          activeLogin: true,
          loginCSS: true,
          errorMessage: errors.array()[0] && errors.array()[0].msg,
          oldInput: {
            email,
            password
          },
          validationErrors:[]
        })
      }
    })
    .catch(err => { console.error(err); res.redirect('/login')})
  }).catch(err => {
    const error = new Error(err);//important to create error
    error.httpStatusCode = 500;
    return next(error); //in this case all other middlewares will be scipped and move stright to error handling middleware
})
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
    .catch(err => {
      const error = new Error(err);//important to create error
      error.httpStatusCode = 500;
      return next(error); //in this case all other middlewares will be scipped and move stright to error handling middleware
    })
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
  }).catch(err => {
    const error = new Error(err);//important to create error
    error.httpStatusCode = 500;
    return next(error); //in this case all other middlewares will be scipped and move stright to error handling middleware
  })
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
  .catch(err => {
    const error = new Error(err);//important to create error
    error.httpStatusCode = 500;
    return next(error); //in this case all other middlewares will be scipped and move stright to error handling middleware
  })

};