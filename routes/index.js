var express = require('express');
var router = express.Router();

const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');

// GET routes
router.get('/', messageController.index);

router.get('/sign-up', userController.signup_get);

router.get('/login', userController.login_get);

router.get('/membership', userController.membership_get);

router.get('/admin', userController.admin_get);

// POST routes
router.post('/sign-up', userController.signup_post);

router.post('/login', userController.login_post);

router.post('membership', userController.membership_post);

router.post('/', messageController.message_post);

router.post('/admin', userController.admin_post);

module.exports = router;
