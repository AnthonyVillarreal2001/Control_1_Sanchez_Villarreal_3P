require('dotenv').config();
const express = require('express');
const orderRoutes = require('./controllers/orderController');
const { connectDB } = require('./models/db');
const { startRabbitMQConsumer } = require('./rabbitmq/consumer');

const app = express();
app.use(express.json());

app.use('/api/v1/orders', orderRoutes);

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
    startRabbitMQConsumer();
    app.listen(PORT, () => {
        console.log(`Order Service running on port ${PORT}`);
    });
});