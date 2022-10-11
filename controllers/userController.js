const User = require('../models/user');

const { body, validationResult } = require('express-validator');

// sign up page
exports.index = (req, res, next) => {
  res.render('index', { title: 'Express' });
};

exports.signup_get = (req, res, next) => {
  res.render('sign-up', { title: 'Members Only Sign Up' });
};

exports.signup_post = (req, res, next) => {
  res.send('Sign up post');
};

exports.login_get = (req, res, next) => {
  res.render('login', { title: 'Members Only Login' });
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
