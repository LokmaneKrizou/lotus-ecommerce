const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const tokenController = require('../controller/tokenController');
const authMiddleware = require('../../../middleware/authMiddleware');

router.post('/signup', userController.signup);
router.post('/login', userController.mobileLogin);
router.post('/signin', userController.webLogin);
router.get('/logout', authMiddleware, userController.logout);
router.post('/refreshToken', tokenController.mobileRefreshToken);
router.post('/webTokenRefresh', tokenController.webRefreshToken);

module.exports = router;