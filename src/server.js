const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const userRoutes = require('./features/users/routes/userRoutes');
const authRoutes = require('./features/users/routes/authRoutes');
const orderRoutes = require('./features/orders/routes/orderRoutes');
const productRoutes = require('./features/products/routes/productRoutes');
const cartRoutes = require('./features/cart/routes/cartRoutes');
const etsyRoutes = require('./features/etsy/routes/etsyRoutes');
const dbConnection = require("./database");
const validateRequestBody = require('./middleware/validateRequestBodyMiddleware')
const dotenv = require("dotenv");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const https = require('https');
const session = require("express-session");

dotenv.config();
const app = express();
app.use(cookieParser());

// Middlewares
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
// Connect to MongoDb
dbConnection()

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));

// Enable CORS for all routes
const allowedOrigins = [
    'https://localhost:3001', // Your React app URL
    'http://localhost:3001', // Your React app URL
    'http://192.168.1.82:3001',    // Another allowed origin
    'https://localhost:3000', // Your React app URL
    'http://localhost:3000', // Your React app URL
    'http://192.168.1.82:3000',
    'https://192.168.1.82:3000'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/carts', cartRoutes);
app.use('/etsy', etsyRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).send(err.message);
});
// Start server
const PORT = process.env.PORT || 3000;
const privateKeyPassphrase = 'kikinat2021'; // Replace with your actual passphrase
const httpsOptions = {
    key: fs.readFileSync('./key.pem', {encoding: 'utf8', flag: 'r'}),
    passphrase: privateKeyPassphrase,
    cert: fs.readFileSync('./cert.pem', {encoding: 'utf8', flag: 'r'}),
};
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});