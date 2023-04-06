const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const userRoutes = require('./features/users/routes/userRoutes');
const authRoutes = require('./features/users/routes/authRoutes');
const orderRoutes = require('./features/orders/routes/orderRoutes');
const productRoutes = require('./features/products/routes/productRoutes');
const dbConnection = require("./database");
const validateRequestBody = require('./middleware/validateRequestBodyMiddleware')
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(bodyParser.json());
// Connect to MongoDb
dbConnection()

// Apply request validator middleware to all POST requests
app.post('*', validateRequestBody);

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

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
