const User = require('../models/user');
const Message = require('../models/message');
const Membership = require('../models/membership');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const date = require('date-and-time');

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
  Message.find({})
    .sort({ date: -1 })
    .exec((err, messages) => {
      if (err) {
        return next(err);
      }
      const formatDate = (unformattedDate) => {
        const currentDate = new Date();
        if (date.isSameDay(unformattedDate, currentDate)) {
          // get hours apart
          const hoursAgo = parseInt(
            date.subtract(currentDate, unformattedDate).toHours()
          );
          if (hoursAgo) {
            if (hoursAgo == 1) {
              return `${hoursAgo} hour ago`;
            }
            return `${hoursAgo} hours ago`;
          }
          const minsAgo = parseInt(
            date.subtract(currentDate, unformattedDate).toMinutes()
          );
          if (minsAgo) {
            if (minsAgo == 1) {
              return `${minsAgo} minute ago`;
            }
            return `${minsAgo} minutes ago`;
          }
          const secsAgo = date
            .subtract(currentDate, unformattedDate)
            .toSeconds();
          if (secsAgo == 1) {
            return `${secsAgo} second ago`;
          }
          return `${secsAgo} seconds ago`;
        }
        return date.format(unformattedDate, 'MMM DD YYYY');
      };
      let formatted = [];
      // formats the date of each message
      messages.forEach((message) => {
        let newMessage = {
          _id: message._id,
          date: formatDate(message.date),
          username: message.username,
          title: message.title,
          message: message.message,
        };
        formatted.push(newMessage);
      });
      res.render('index', {
        user: req.user,
        messages: formatted,
      });
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
    res.render('login', { loginPg: true, fail: req.query.fail });
  },
];

exports.login_post = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?fail=True',
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
    if (req.user.isMember) {
      res.redirect('/');
    }
    res.render('membership', {
      user: req.user,
    });
  },
];

exports.membership_post = [
  loggedInCheck,
  (req, res, next) => {
    Membership.findOne({ type: 'membership' }, (err, memberData) => {
      if (err | !memberData) {
        res.render('membership', {
          user: req.user,
          msg: 'Failed to get data',
        });
        return;
      }
      bcrypt.compare(
        req.body.membership_code,
        memberData.code,
        (err, match) => {
          if (match) {
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
            // incorrect code
            res.render('membership', {
              user: req.user,
              msg: 'Incorrect Code',
            });
          }
        }
      );
    });
  },
];

exports.admin_get = [
  loggedInCheck,
  (req, res, next) => {
    if (!req.user.isMember | req.user.isAdmin) {
      res.redirect('/');
    }
    res.render('membership', {
      user: req.user,
    });
  },
];

exports.admin_post = [
  loggedInCheck,
  (req, res, next) => {
    Membership.findOne({ type: 'admin' }, (err, memberData) => {
      if (err | !memberData) {
        res.render('membership', {
          user: req.user,
          msg: 'Failed to get data',
        });
        return;
      }
      bcrypt.compare(
        req.body.membership_code,
        memberData.code,
        (err, match) => {
          if (match) {
            // codes match! add membership status
            User.updateOne(
              { username: req.user.username },
              { $set: { isAdmin: true } },
              (err, success) => {
                if (err) {
                  res.render('membership', {
                    user:
                      req.user && req.user.username ? req.user.username : null,
                    msg: 'Failed to add admin',
                  });
                  return;
                }
                res.redirect('/');
                return;
              }
            );
          } else {
            // incorrect code
            res.render('membership', {
              user: req.user,
              msg: 'Incorrect Code',
            });
          }
        }
      );
    });
  },
];
