const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const tokenController = require('../controller/tokenController');
const authMiddleware = require('../../../middleware/authMiddleware');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', authMiddleware, userController.logout);
router.post('/refreshToken', tokenController.refreshToken);

module.exports = router;