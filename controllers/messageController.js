const Message = require('../models/message');

const { body, validationResult } = require('express-validator');

exports.create_post = [
  body('post_title').isLength({ max: 100 }).escape(),
  body('post_message').isLength({ min: 2, max: 1000 }).escape(),
  (req, res, next) => {
    const user = req.user;
    // check if errors
    const errors = validationResult(req);
    const errs = {};

    if (errors.errors.length | !user) {
      if (!user) {
        errs.user = 'You must be logged in to create a post.';
      }
      for (let err of errors.errors) {
        errs[err.param] = err.msg;
      }
      res.render('create-post', {
        errs: errs,
        createPg: true,
        post_title: req.body.post_title ? req.body.post_title : null,
        post_message: req.body.post_message ? req.body.post_message : null,
      });
      return;
    }
    const username = user.username;
    const message = new Message({
      username: username,
      date: Date(),
      title: req.body.post_title ? req.body.post_title : 'Untitled Post',
      message: req.body.post_message,
    }).save((err) => {
      if (err) {
        return next(err);
      }
    });
    res.redirect('/');
  },
];

exports.create_get = (req, res, next) => {
  if (req.user) {
    res.render('create-post', { createPg: true });
  } else {
    res.redirect('/login');
  }
};

exports.delete_post = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    Message.findOneAndDelete({ _id: req.body.message_id }, (err, success) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  }
};
