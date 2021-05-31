const express = require('express');
const User = require('../models/user');
const { check, body } = require('express-validator/check');

const authCtrl = require('../controllers/auth');

const router = express.Router();

router.get('/login', authCtrl.getlogin);
router.post('/login', 
  [
    check('email')
    .isEmail()
    .withMessage('Please use valid email')
    .normalizeEmail()
    .trim(),
    body('password', 'Please use valid password')
    .isAlphanumeric()
    .isLength({min: 5})
    .trim()
  ],
  authCtrl.postLogin);
router.post('/logout', authCtrl.postLogout);
router.get('/signup', authCtrl.getSignUp);
router.post('/signup', 
  [
    check('email')
      .isEmail()
      .withMessage('Please add a valid email')
      .normalizeEmail()
      .trim()
      .custom((value, { req }) => { //custom validation
        //async validation
        return User.findOne({email: value}).then(user => {
          if(user){ 
            return Promise.reject('Email already exists');
          }
        });
        // if(value === 'test@test.com') {
        //   throw new Error('This email address in not allowed');
        // }
        // return true;
      }),
      //body() we can use when we know that following input will be on body
      body('password', 'Please add password only numbers and letters with min 5 chars').isLength({min: 5}).isAlphanumeric().trim(),
      body('repeatPassword').trim().custom((value, { req }) => {
        console.log(value, req.body.password)
        if(value !== req.body.password){
          throw new Error('Passwords have to match');
        }
        return true;
      })
  ],
    authCtrl.postSignUp);
router.get('/reset', authCtrl.getResetPassword);
router.post('/reset', authCtrl.postResetPassword);
router.get('/reset/:token', authCtrl.getNewPassword);
router.post('/new-password', authCtrl.postNewPassword);
module.exports = router;
