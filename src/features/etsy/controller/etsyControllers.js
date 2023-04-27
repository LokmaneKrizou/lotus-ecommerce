const fetch = require('node-fetch');
const etsyAuth = require('../integration/etsyIntegration');

async function authenticate(req, res) {
    try {
        const token = await etsyAuth.code.getToken(req.originalUrl);
        req.session.oauthToken = token;
        res.redirect('/success');
    } catch (error) {
        console.error('Error during OAuth callback:', error);
        res.status(500).send('Authentication failed');
    }
}

async function fetchActiveListings(shopId, accessToken) {
    const endpoint = `https://openapi.etsy.com/v3/shops/${shopId}/listings/active`;

    try {
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching listings: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(error);
        return [];
    }
}

module.exports = {
    authenticate,
    fetchActiveListings,
};
