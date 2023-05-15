const axios = require('axios');
const crypto = require('crypto');

class EtsyIntegration {
    constructor(clientId, clientSecret, redirectUri, session) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.tokenUrl = 'https://api.etsy.com/v3/public/oauth/token';
        this.authorizationUrl = 'https://www.etsy.com/oauth/connect';
        this.session = session;
    }

    generateStateValue() {
        return crypto.randomBytes(16).toString('hex');
    }

    generateCodeVerifier() {
        return crypto.randomBytes(32).toString('hex');
    }

    generateCodeChallenge(codeVerifier) {
        return crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    startOAuthFlowPKCE() {
        const codeVerifier = this.generateCodeVerifier();
        const codeChallenge = this.generateCodeChallenge(codeVerifier);

        this.session.codeVerifier = codeVerifier;

        const state = this.generateStateValue();
        this.session.state = state;

        const params = new URLSearchParams({
            response_type: 'code',
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            scope: 'listings_r',
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });

        return `${this.authorizationUrl}?${params.toString()}`;
    }

    async exchangeCodeForToken(code) {
        const params = new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: this.clientId,
                redirect_uri: this.redirectUri,
                code: code,
                code_verifier: this.session.codeVerifier
            })
        ;

        const authString = `${this.clientId}:${this.clientSecret}`;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        const response = await axios.post(this.tokenUrl, params, {headers});
        return response.data;
    }

    async refreshToken(refreshToken) {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });

        const response = await axios.post(this.tokenUrl, params);
        return response.data;
    }

    async exchangeLegacyToken(legacyToken) {
        const params = new URLSearchParams({
            grant_type: 'token_exchange',
            legacy_token: legacyToken,
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });

        const response = await axios.post(this.tokenUrl, params);
        return response.data;
    }
}

module.exports = EtsyIntegration;
