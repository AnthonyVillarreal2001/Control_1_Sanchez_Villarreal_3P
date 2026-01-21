require('dotenv').config();
const express = require('express');
const inventoryRoutes = require('./controllers/inventoryController');
const { connectDB } = require('./models/db');
const { startRabbitMQConsumer } = require('./rabbitmq/consumer');

const app = express();
app.use(express.json());

app.use('/api/v1/products', inventoryRoutes);

const PORT = process.env.PORT || 3002;

connectDB().then(() => {
    startRabbitMQConsumer();
    app.listen(PORT, () => {
        console.log(`Inventory Service running on port ${PORT}`);
    });
});