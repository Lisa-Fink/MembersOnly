const Message = require('../models/message');

const { body, validationResult } = require('express-validator');

// main page
exports.index = (req, res, next) => {
  res.render('index', { title: 'Express' });
};

exports.create_post = (req, res, next) => {
  res.send('message post');
};

exports.create_get = (req, res, next) => {
  res.render('create-post');
};
