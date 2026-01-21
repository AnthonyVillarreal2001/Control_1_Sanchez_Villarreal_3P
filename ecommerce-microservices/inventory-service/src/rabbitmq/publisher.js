const amqp = require('amqplib');

let channel, connection;

const connectRabbitMQ = async () => {
    if (channel) return channel;
    
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        
        await channel.assertExchange(process.env.ORDER_EXCHANGE, 'direct', { durable: true });
        await channel.assertQueue(process.env.RESPONSE_QUEUE, { durable: true });
        await channel.bindQueue(process.env.RESPONSE_QUEUE, process.env.ORDER_EXCHANGE, 'inventory.response');
        
        console.log('RabbitMQ connected (Publisher - Inventory)');
        return channel;
    } catch (err) {
        console.error('RabbitMQ connection error:', err);
        throw err;
    }
};

const publishInventoryResponse = async (responseData) => {
    try {
        const channel = await connectRabbitMQ();
        const message = {
            ...responseData,
            timestamp: new Date().toISOString()
        };
        
        channel.publish(
            process.env.ORDER_EXCHANGE,
            'inventory.response',
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
        
        console.log(`📤 ${responseData.eventType} event published for order ${responseData.orderId}`);
    } catch (err) {
        console.error('❌ Error publishing inventory response:', err);
        // Reintentar después de 5 segundos
        setTimeout(() => publishInventoryResponse(responseData), 5000);
    }
};

module.exports = { publishInventoryResponse };