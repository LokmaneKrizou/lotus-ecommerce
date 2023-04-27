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

dotenv.config();
const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
// Connect to MongoDb
dbConnection()

// Apply request validator middleware to all POST requests
app.post('*', validateRequestBody);
// Enable CORS for all routes
const allowedOrigins = [
    'http://localhost:3001', // Your React app URL
    'http://192.168.1.38:3001',    // Another allowed origin
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/carts', cartRoutes);
app.use('/etsy-integration', etsyRoutes);

// Error handling middleware
app.use((err, res) => {
    console.error(err.stack);
    res.status(err.statusCode).send(err.message);
});
// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
