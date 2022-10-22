const User = require('../models/user');
const Message = require('../models/message');
const Membership = require('../models/membership');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

const loggedOutCheck = (req, res, next) => {
  if (req.user) {
    res.redirect('/');
    return;
  }
  return next();
};

const loggedInCheck = (req, res, next) => {
  if (!req.user) {
    res.redirect('/login');
    return;
  }
  return next();
};

exports.index = async (req, res, next) => {
  // get messages
  const messages = await Message.find({});
  if (messages == null) {
    return next(err);
  }
  res.render('index', {
    user: req.user && req.user.username ? req.user.username : null,
    isMember: req.user && req.user.isMember ? req.user.isMember : null,
    messages: messages,
  });
};

exports.signup_get = [
  loggedOutCheck,
  (req, res, next) => {
    res.render('sign-up', { signUpPg: true });
  },
];

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
  body('s_password', 'password must be between 6-20 characters').isLength({
    min: 6,
    max: 20,
  }),
  body('s_password_confirm').custom((value, { req }) => {
    if (value !== req.body.s_password) {
      throw new Error('passwords do not match');
    }

    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    const errs = {};
    if (errors.errors.length) {
      for (let err of errors.errors) {
        errs[err.param] = err.msg;
      }

      res.render('sign-up', {
        errs: errs,
        signUpPg: true,
        signUp: true,
        username: req.body.s_username,
        email: req.body.s_email,
      });
      return;
    }
    // add the new user to mongodb
    bcrypt.hash(req.body.s_password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      const user = new User({
        username: req.body.s_username,
        password: hashedPassword,
        email: req.body.s_email,
        isMember: false,
        isAdmin: false,
      }).save((err) => {
        if (err) {
          return next(err);
        }
      });
    });
    res.redirect('/');
  },
];

exports.login_get = [
  loggedOutCheck,
  (req, res, next) => {
    res.render('login', { loginPg: true });
  },
];

exports.login_post = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
});

exports.logout_get = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.membership_get = [
  loggedInCheck,
  (req, res, next) => {
    res.render('membership', {
      user: req.user && req.user.username ? req.user.username : null,
    });
  },
];

exports.membership_post = [
  loggedInCheck,
  (req, res, next) => {
    Membership.findOne({ type: 'membership' }, (err, memberData) => {
      if (err | !memberData) {
        res.render('membership', {
          user: req.user && req.user.username ? req.user.username : null,
          msg: 'Failed to get data',
        });
        return;
      }
      bcrypt.compare(
        req.body.membership_code,
        memberData.code,
        (err, match) => {
          if (match) {
            console.log('match');
            // codes match! add membership status
            User.updateOne(
              { username: req.user.username },
              { $set: { isMember: true } },
              (err, success) => {
                if (err) {
                  res.render('membership', {
                    user:
                      req.user && req.user.username ? req.user.username : null,
                    msg: 'Failed to add member',
                  });
                  return;
                }
                res.redirect('/');
                return;
              }
            );
          } else {
            // passwords do not match!
            res.render('membership', {
              user: req.user && req.user.username ? req.user.username : null,
              msg: 'Incorrect Code',
            });
          }
        }
      );
    });
  },
];

exports.admin_get = (req, res, next) => {
  res.send('Request Admin Status');
};

exports.admin_post = (req, res, next) => {
  res.send('Post Admin Request');
};
