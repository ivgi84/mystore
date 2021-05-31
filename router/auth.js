const express = require('express');

const authCtrl = require('../controllers/auth');

const router = express.Router();

router.get('/login', authCtrl.getlogin);
router.post('/login', authCtrl.postLogin);
router.post('/logout', authCtrl.postLogout);
router.get('/signup', authCtrl.getSignUp);
router.post('/signup', authCtrl.postSignUp);
router.get('/reset', authCtrl.getResetPassword);
router.post('/reset', authCtrl.postResetPassword);
router.get('/reset/:token', authCtrl.getNewPassword);
router.post('/new-password', authCtrl.postNewPassword);
module.exports = router;
