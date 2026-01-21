const amqp = require('amqplib');
const { pool } = require('../models/db');

const startRabbitMQConsumer = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        await channel.assertExchange(process.env.ORDER_EXCHANGE, 'direct', { durable: true });
        await channel.assertQueue(process.env.RESPONSE_QUEUE, { durable: true });
        await channel.bindQueue(process.env.RESPONSE_QUEUE, process.env.ORDER_EXCHANGE, 'inventory.response');
        
        console.log('RabbitMQ consumer started (Order Service)');
        
        channel.consume(process.env.RESPONSE_QUEUE, async (msg) => {
            if (msg) {
                const message = JSON.parse(msg.content.toString());
                console.log(`Received response: ${message.eventType} for order ${message.orderId}`);
                
                try {
                    if (message.eventType === 'StockReserved') {
                        await pool.query(
                            `UPDATE orders SET status = 'CONFIRMED', updated_at = NOW() WHERE order_id = $1`,
                            [message.orderId]
                        );
                        console.log(`Order ${message.orderId} confirmed`);
                    } else if (message.eventType === 'StockRejected') {
                        await pool.query(
                            `UPDATE orders SET status = 'CANCELLED', reason = $1, updated_at = NOW() WHERE order_id = $2`,
                            [message.reason, message.orderId]
                        );
                        console.log(`Order ${message.orderId} cancelled: ${message.reason}`);
                    }
                } catch (err) {
                    console.error('Error updating order:', err);
                }
                
                channel.ack(msg);
            }
        }, { noAck: false });
    } catch (err) {
        console.error('RabbitMQ consumer error:', err);
        setTimeout(startRabbitMQConsumer, 5000);
    }
};

module.exports = { startRabbitMQConsumer };