const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const connectDB = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Inventory DB connected');
        
        // Crear tabla products_stock
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products_stock (
                product_id VARCHAR(255) PRIMARY KEY,
                available_stock INTEGER NOT NULL DEFAULT 0,
                reserved_stock INTEGER NOT NULL DEFAULT 0,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        
        // Insertar productos de prueba
        await pool.query(`
            INSERT INTO products_stock (product_id, available_stock, reserved_stock)
            VALUES 
                ('a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d', 25, 0),
                ('b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f', 10, 0),
                ('P-001', 100, 0),
                ('P-777', 50, 0)
            ON CONFLICT (product_id) DO NOTHING;
        `);
        
        console.log('Inventory tables created/verified with sample data');
    } catch (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };