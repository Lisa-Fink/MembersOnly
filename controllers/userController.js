const User = require('../models/user');

const { body, validationResult } = require('express-validator');

exports.index = (req, res, next) => {
  res.render('index');
};

exports.signup_get = (req, res, next) => {
  res.render('sign-up', { signUpPg: true });
};

exports.signup_post = [
  body('s_username', 'Username is not valid')
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric()
    .escape()
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        username: req.body.s_username,
      }).count();

      if (user) {
        console.log(user);
        throw new Error('Username not available');
      }
    }),
  body('s_email', 'Email is not valid')
    .isEmail()
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const isNotAvailable = await User.findOne({
        email: req.body.s_email,
      }).count();
      if (isNotAvailable) {
        throw new Error('There already is an account with that email');
      }
    }),
  body('s_password', 'password must be between 6-20 characters')
    .isLength({
      min: 6,
      max: 20,
    })
    .escape(),
  body('s_password_confirm')
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.s_password) {
        throw new Error('passwords do not match');
      }

      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    const errs = {};
    if (errors.errors.length) {
      const errs = {};
      for (let err of errors.errors) {
        errs[err.param] = err.msg;
      }

      res.render('sign-up', {
        errs: errs,
        signUpPg: true,
        signUp: true,
        username: req.body.s_username,
        email: req.body.s_email,
        password: req.body.s_password,
        passwordConf: req.body.s_password_confirm,
      });
      return;
    }
    res.redirect('/');
  },
];

exports.login_get = (req, res, next) => {
  res.render('login', { loginPg: true });
};

exports.login_post = (req, res, next) => {
  res.send('login post');
};

exports.membership_get = (req, res, next) => {
  res.send('Request Membership');
};

exports.membership_post = (req, res, next) => {
  res.send('Membership post');
};

exports.admin_get = (req, res, next) => {
  res.send('Request Admin Status');
};

exports.admin_post = (req, res, next) => {
  res.send('Post Admin Request');
};
