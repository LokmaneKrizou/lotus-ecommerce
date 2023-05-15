const EtsyIntegration = require('../integration/etsyIntegration');
require('dotenv').config();
const fetch = require('node-fetch');
const listingToProduct = require("./listingToProduct");
const {InternalServerException} = require("../../../common/exceptions");
const {Headers} = fetch;

const clientId = process.env.ETSY_CLIENT_ID;
const clientSecret = process.env.ETSY_CLIENT_SECRET;
const redirectUri = 'https://localhost:3000/etsy/callback';

async function startOAuthFlow(req, res) {
    const etsyIntegration = new EtsyIntegration(clientId, clientSecret, redirectUri, req.session);
    const authorizationUrl = etsyIntegration.startOAuthFlowPKCE();
    res.redirect(authorizationUrl);
}

async function handleOAuthCallback(req, res) {
    const {code, state} = req.query;

    if (state !== req.session.state) {
        res.status(400).send('Invalid state value');
        return;
    }

    try {
        const etsyIntegration = new EtsyIntegration(clientId, clientSecret, redirectUri, req.session);
        const tokenData = await etsyIntegration.exchangeCodeForToken(code);
        req.session.accessToken = tokenData.access_token;
        req.session.refreshToken = tokenData.refresh_token;
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("x-api-key", clientId);
        headers.append("Authorization", `Bearer ${tokenData.access_token}`);
        const requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };
        const shopId = 27717435;
        console.log('Getting active listings');
        const activeListings = await getAllListings(shopId, clientId, requestOptions);
        for (const listing of activeListings) {
            const extractedVariations = (listing.has_variations) ? extractVariations(listing.inventory.products) : null;
            const imageUrls = listing.images.map(image => image.url_fullxfull);
            const result = await listingToProduct({
                id: listing.listing_id,
                title: listing.title,
                description: listing.description,
                quantity: listing.quantity,
                price: (listing.price.amount / listing.price.divisor) * 251, // convert GBP to DA
                views: listing.views,
                images: imageUrls,
                variations: extractedVariations
            });
            if (!result.success) {
                throw new InternalServerException("We couldn't parse Etsy listing to product")
            }
        }
        res.json({success: true});
    } catch (err) {
        console.log(err);
        res.status(400).send(`Failed to get access token`);
    }

}


async function getAllListings(shopId, clientId, requestOptions) {
    let listings = [];
    let limit = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(`https://api.etsy.com/v3/application/shops/${shopId}/listings?state=active&limit=${limit}&offset=${offset}&includes=Inventory,Images`, requestOptions);
        const data = await response.json();
        if (!data || !data.results) {
            console.error('Unexpected API response:', data);
            throw new Error('Failed to retrieve listings from the API.');
        }

        listings = listings.concat(data.results);
        offset += limit;
        if (data.results.length < limit) {
            hasMore = false;
        }
    }
    return listings;
}


function extractVariations(variations) {
    return variations.map(variation => {
        const properties = variation.property_values.map(prop => {
            return {name: prop.property_name, value: prop.values[0]}
        })
        const quantity = variation.offerings[0].quantity;
        return {
            quantity,
            properties
        };
    });
}

async function refreshToken(req, res) {
    try {
        const etsyIntegration = new EtsyIntegration(clientId, clientSecret, redirectUri, req.session);
        const tokenData = await etsyIntegration.refreshToken(req.session.refreshToken);
        req.session.accessToken = tokenData.access_token;
        req.session.refreshToken = tokenData.refresh_token;
        res.send('Access token refreshed and stored in session.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to refresh token.');
    }
}

module.exports = {startOAuthFlow, handleOAuthCallback, refreshToken};
