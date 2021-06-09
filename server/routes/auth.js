const express = require('express');
const { body } = require('express-validator'); 

const authController = require('../controllers/auth');

const User = require('../model/user');

const router = express.Router();


const userValidation = [
  body('email')
  .isEmail().withMessage('Please add a valid email')
  .custom((value, { req }) => { // custom validation for email
    return User.findOne({ email: value }).then(userDoc => {
      if(userDoc){
        return Promise.reject('Email already exists');
      }
    })
  })
  .normalizeEmail(),
  body('password').trim().isLength({min: 5}),
  body('name').trim().not().isEmpty() //not().isEmpty() : validation that field is not empty
];

router.put('/signup', userValidation, authController.signup);

router.post('/login', authController.login)

module.exports = router;