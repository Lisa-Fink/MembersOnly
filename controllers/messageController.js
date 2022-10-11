const Message = require('../models/message');

const { body, validationResult } = require('express-validator');

// main page
exports.index = (req, res, next) => {
  res.render('index', { title: 'Express' });
};

exports.message_post = (req, res, next) => {
  res.send('message post');
};
