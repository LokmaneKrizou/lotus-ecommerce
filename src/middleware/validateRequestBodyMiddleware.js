// Request validator middleware to check if request body is empty for POST requests
module.exports =
    validateRequestBody = (req, res, next) => {
        if (req.method === 'POST' && Object.keys(req.body).length === 0) {
            return res.status(400).json({error: 'Request body cannot be empty'});
        }
        next();
    };