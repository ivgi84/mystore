const User = require('../model/user');
const { validationResult } = require('express-validator'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const errorHandler = (err, next) => {
  if(!err.statusCode){
    err.statusCode = 500;
  }
  next(err);
}


exports.signup = (req, res, next) => {

  const validationErrors = validationResult(req);
  if(!validationErrors.isEmpty()) {
    const error = new Error('Validation error, some field is not valid');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  bcrypt.hash(password, 12).then(hashedPassword => {
    const user = new User({
      email,
      name,
      password: hashedPassword
    })
    return user.save();
  })
  .then(result => {
    res.status(201).json({message: 'User created', userId: result._id});
  })
  .catch(err => {
    errorHandler(err, next)
  })
}

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email })
    .then(user => {
      if(!user) {
        const error = new Error('This user does not exist');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if(!isEqual) {
        const error = new Error('Wrong password');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      }, 'some_super_secret_key',{ expiresIn: '1h' });
      res.status(200).json({ 
        token,
        userId: loadedUser._id.toString()
      })
    })
    .catch(err => {
      errorHandler(err, next);
    })
}