const ClientOAuth2 = require('client-oauth2');
require('dotenv').config();

const apiKey = process.env.ETSY_API_KEY;
const apiSecret = process.env.ETSY_SHARED_SECRET;

const etsyAuth = new ClientOAuth2({
    clientId: apiKey,
    clientSecret: apiSecret,
    accessTokenUri: 'https://api.etsy.com/v3/oauth/token',
    authorizationUri: 'https://www.etsy.com/oauth/connect',
    redirectUri: 'http://localhost:3000/etsy/callback', // Replace with your server's callback URL
    scopes: ['listings_r'],
});

module.exports = etsyAuth;