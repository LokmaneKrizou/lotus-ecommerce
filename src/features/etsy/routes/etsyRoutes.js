const express = require('express');
const router = express.Router();
const etsyAuth = require('../integration/etsyIntegration');
const { authenticate } = require('../controller/etsyControllers');

router.get('/auth', (req, res) => {
    const uri = etsyAuth.code.getUri();
    res.redirect(uri);
});

router.get('/callback', authenticate);

module.exports = router;
