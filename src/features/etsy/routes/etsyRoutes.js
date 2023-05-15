const express = require('express');
const etsyController = require('../controller/etsyControllers');

const router = express.Router();

router.get('/oauth', etsyController.startOAuthFlow);
router.get('/callback', etsyController.handleOAuthCallback);
router.get('/refresh', etsyController.refreshToken);
module.exports = router;
