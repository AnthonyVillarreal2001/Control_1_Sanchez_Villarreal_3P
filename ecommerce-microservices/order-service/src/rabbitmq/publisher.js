const amqp = require('amqplib');

let channel, connection;

const connectRabbitMQ = async () => {
    if (channel) return channel;
    
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        
        await channel.assertExchange(process.env.ORDER_EXCHANGE, 'direct', { durable: true });
        await channel.assertQueue(process.env.INVENTORY_QUEUE, { durable: true });
        await channel.bindQueue(process.env.INVENTORY_QUEUE, process.env.ORDER_EXCHANGE, 'order.created');
        
        console.log('RabbitMQ connected (Publisher)');
        return channel;
    } catch (err) {
        console.error('RabbitMQ connection error:', err);
        throw err;
    }
};

const publishOrderCreated = async (orderData) => {
    try {
        const channel = await connectRabbitMQ();
        const message = {
            eventType: "OrderCreated",
            orderId: orderData.orderId,
            correlationId: require('uuid').v4(),
            createdAt: new Date().toISOString(),
            customerId: orderData.customerId,
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
            paymentReference: orderData.paymentReference
        };
        
        channel.publish(
            process.env.ORDER_EXCHANGE,
            'order.created',
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
        
        console.log(`✅ OrderCreated event published: ${orderData.orderId}`);
    } catch (err) {
        console.error('❌ Error publishing event:', err);
        // Reintentar después de 5 segundos
        setTimeout(() => publishOrderCreated(orderData), 5000);
    }
};

module.exports = { publishOrderCreated };