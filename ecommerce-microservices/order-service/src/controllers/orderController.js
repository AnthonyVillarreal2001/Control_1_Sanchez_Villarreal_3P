const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../models/db');
const { publishOrderCreated } = require('../rabbitmq/publisher');

const router = express.Router();

router.post('/', async (req, res) => {
    const { customerId, items, shippingAddress, paymentReference } = req.body;
    const orderId = uuidv4();
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Insertar orden
        await client.query(
            `INSERT INTO orders (order_id, customer_id, status) VALUES ($1, $2, 'PENDING')`,
            [orderId, customerId]
        );

        // Insertar items
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)`,
                [orderId, item.productId, item.quantity]
            );
        }

        await client.query('COMMIT');
        
        // Publicar evento a RabbitMQ
        await publishOrderCreated({ 
            orderId, 
            customerId, 
            items,
            shippingAddress,
            paymentReference
        });
        
        res.status(201).json({
            orderId,
            status: "PENDING",
            message: "Order received. Inventory check in progress."
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', err);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
});

router.get('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    
    try {
        // Obtener orden
        const orderResult = await pool.query(
            `SELECT * FROM orders WHERE order_id = $1`,
            [orderId]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        const order = orderResult.rows[0];
        
        // Obtener items de la orden
        const itemsResult = await pool.query(
            `SELECT product_id as "productId", quantity FROM order_items WHERE order_id = $1`,
            [orderId]
        );
        
        const response = {
            orderId: order.order_id,
            customerId: order.customer_id,
            status: order.status,
            items: itemsResult.rows,
            updatedAt: order.updated_at
        };
        
        if (order.reason) {
            response.reason = order.reason;
        }
        
        if (order.status === 'PENDING') {
            response.message = "Inventory verification pending.";
        }
        
        res.json(response);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;