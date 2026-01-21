const express = require('express');
const { pool } = require('../models/db');

const router = express.Router();

router.get('/:productId/stock', async (req, res) => {
    const { productId } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT * FROM products_stock WHERE product_id = $1`,
            [productId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        const product = result.rows[0];
        res.json({
            productId: product.product_id,
            availableStock: product.available_stock,
            reservedStock: product.reserved_stock,
            updatedAt: product.updated_at
        });
    } catch (err) {
        console.error('Error fetching product stock:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint adicional para ver todos los productos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM products_stock ORDER BY product_id`
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;