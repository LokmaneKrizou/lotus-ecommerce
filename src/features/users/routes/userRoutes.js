const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../../../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', userController.getUsers);
router.get('/me', userController.getUser);
router.put('/me', userController.updateUser);
router.delete('/me', userController.deleteUser);

module.exports = router;