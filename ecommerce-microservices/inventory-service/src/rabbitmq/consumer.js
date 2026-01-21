const amqp = require('amqplib');
const { pool } = require('../models/db');
const { publishInventoryResponse } = require('./publisher');

const startRabbitMQConsumer = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        await channel.assertExchange(process.env.ORDER_EXCHANGE, 'direct', { durable: true });
        await channel.assertQueue(process.env.INVENTORY_QUEUE, { durable: true });
        await channel.bindQueue(process.env.INVENTORY_QUEUE, process.env.ORDER_EXCHANGE, 'order.created');
        
        console.log('✅ RabbitMQ consumer started (Inventory Service)');
        
        channel.consume(process.env.INVENTORY_QUEUE, async (msg) => {
            if (msg) {
                const message = JSON.parse(msg.content.toString());
                console.log(`📦 Processing OrderCreated for order ${message.orderId}`);
                
                try {
                    const client = await pool.connect();
                    await client.query('BEGIN');
                    
                    let allAvailable = true;
                    let rejectedProduct = null;
                    let insufficientQuantity = 0;
                    let productNotFound = false;
                    
                    // Verificar stock para cada producto
                    for (const item of message.items) {
                        const result = await client.query(
                            `SELECT available_stock FROM products_stock WHERE product_id = $1 FOR UPDATE`,
                            [item.productId]
                        );
                        
                        if (result.rows.length === 0) {
                            allAvailable = false;
                            rejectedProduct = item.productId;
                            productNotFound = true;
                            break;
                        }
                        
                        const availableStock = result.rows[0].available_stock;
                        if (availableStock < item.quantity) {
                            allAvailable = false;
                            rejectedProduct = item.productId;
                            insufficientQuantity = item.quantity - availableStock;
                            break;
                        }
                    }
                    
                    if (allAvailable) {
                        // Reservar stock
                        for (const item of message.items) {
                            await client.query(
                                `UPDATE products_stock 
                                 SET available_stock = available_stock - $1,
                                     reserved_stock = reserved_stock + $1,
                                     updated_at = NOW()
                                 WHERE product_id = $2`,
                                [item.quantity, item.productId]
                            );
                        }
                        
                        await client.query('COMMIT');
                        client.release();
                        
                        await publishInventoryResponse({
                            eventType: 'StockReserved',
                            orderId: message.orderId,
                            correlationId: message.correlationId,
                            reservedItems: message.items
                        });
                        
                        console.log(`✅ Stock reserved for order ${message.orderId}`);
                    } else {
                        await client.query('ROLLBACK');
                        client.release();
                        
                        // CORRECCIÓN AQUÍ: Usar las variables correctas
                        let reason;
                        if (productNotFound) {
                            reason = `Product ${rejectedProduct} not found in inventory`;
                        } else {
                            reason = `Insufficient stock for product ${rejectedProduct}`;
                        }
                        
                        await publishInventoryResponse({
                            eventType: 'StockRejected',
                            orderId: message.orderId,
                            correlationId: message.correlationId,
                            reason: reason
                        });
                        
                        console.log(`❌ Stock rejected for order ${message.orderId}: ${reason}`);
                    }
                } catch (err) {
                    console.error('Error processing inventory:', err);
                    
                    // Publicar evento de error
                    try {
                        await publishInventoryResponse({
                            eventType: 'StockRejected',
                            orderId: message.orderId,
                            correlationId: message.correlationId,
                            reason: `Inventory processing error: ${err.message}`
                        });
                    } catch (pubErr) {
                        console.error('Failed to publish error event:', pubErr);
                    }
                }
                
                channel.ack(msg);
            }
        }, { noAck: false });
        
        // Manejar cierre de conexión
        connection.on('close', () => {
            console.log('RabbitMQ connection closed. Reconnecting...');
            setTimeout(startRabbitMQConsumer, 5000);
        });
        
    } catch (err) {
        console.error('RabbitMQ consumer error:', err);
        setTimeout(startRabbitMQConsumer, 5000);
    }
};

module.exports = { startRabbitMQConsumer };