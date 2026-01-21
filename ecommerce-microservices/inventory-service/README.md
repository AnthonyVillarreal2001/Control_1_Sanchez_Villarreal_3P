# 📦 Inventory Service

## 📋 Descripción
Microservicio responsable de la gestión de inventario en el sistema de e-commerce. Se encarga de verificar disponibilidad de stock, reservar productos y comunicar resultados al Order Service a través de RabbitMQ.

## 🎯 Funcionalidades
- Verificar disponibilidad de stock
- Reservar productos para pedidos
- Consumir eventos OrderCreated desde RabbitMQ
- Publicar eventos StockReserved/StockRejected
- Proporcionar endpoints para consulta manual de stock

## 🏗️ Arquitectura Interna
Inventory Service
├── Controllers (REST API)
├── Models (PostgreSQL)
├── Services (Lógica de negocio)
└── RabbitMQ (Consumidor/Publicador)

text

## 🚀 Configuración Rápida

### 1. Instalar Dependencias
```bash
npm install
2. Configurar Variables de Entorno
bash
cp .env.example .env
3. Editar Archivo .env
env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=control1_3p_inventorydb
DB_USER=postgres
DB_PASSWORD=1234
RABBITMQ_URL=amqp://admin:admin123@localhost:5673
ORDER_EXCHANGE=order_exchange
INVENTORY_QUEUE=inventory_queue
RESPONSE_QUEUE=order_response_queue
4. Ejecutar el Servicio
bash
# Modo desarrollo
npm run dev

# Modo producción
npm start

🗄️ Estructura de Base de Datos
Tabla: products_stock
sql
CREATE TABLE products_stock (
    product_id VARCHAR(255) PRIMARY KEY,
    available_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

Consumo de Eventos
Queue: inventory_queue

Routing Key: order.created

Mensaje: Evento OrderCreated

Publicación de Eventos
Exchange: order_exchange

Routing Key: inventory.response

Mensajes: StockReserved, StockRejected

Flujo de Procesamiento
text
1. Consume OrderCreated desde inventory_queue
2. Verifica stock para cada producto en la orden
3. Si hay stock suficiente:
   - Reserva stock (available_stock - quantity, reserved_stock + quantity)
   - Publica StockReserved
4. Si NO hay stock suficiente:
   - Publica StockRejected con razón
Formato de Evento StockReserved
json
{
  "eventType": "StockReserved",
  "orderId": "uuid-here",
  "correlationId": "uuid-here",
  "reservedItems": [
    {"productId": "P-001", "quantity": 2}
  ],
  "reservedAt": "2026-01-20T10:32:17Z"
}
Formato de Evento StockRejected
json
{
  "eventType": "StockRejected",
  "orderId": "uuid-here",
  "correlationId": "uuid-here",
  "reason": "Insufficient stock for product P-777",
  "rejectedAt": "2026-01-20T10:32:17Z"
}
🔧 Dependencias Principales
json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "amqplib": "^0.10.3",
  "uuid": "^9.0.0",
  "dotenv": "^16.3.1"
}

📊 Lógica de Negocio
Verificación de Stock
javascript
// Para cada producto en la orden:
1. Verificar que el producto exista
2. Verificar que available_stock >= quantity solicitada
3. Si ambas condiciones se cumplen, proceder con la reserva
Reserva de Stock
sql
-- Actualizar stock disponible y reservado
UPDATE products_stock 
SET available_stock = available_stock - :quantity,
    reserved_stock = reserved_stock + :quantity,
    updated_at = NOW()
WHERE product_id = :productId;
Manejo de Transacciones
Todas las operaciones de stock se realizan dentro de transacciones

Uso de FOR UPDATE para bloqueo de filas

Rollback en caso de error en cualquier producto

🔄 Comandos Útiles
Reiniciar el Servicio
bash
# Detener
npm stop

# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start

📝 Notas de Implementación
Transacciones: Uso de transacciones SQL para consistencia

Bloqueos: Uso de FOR UPDATE para prevenir condiciones de carrera

Reconexión: Reconexión automática a RabbitMQ y PostgreSQL

Logs: Logs detallados con emojis para fácil monitoreo

Escalabilidad: Puede ejecutarse en múltiples instancias (consume de la misma cola)

🏷️ Convenciones
Product IDs: Usar formatos consistentes (UUID o prefijos como P-)

Mensajes de error: Claros y específicos

Códigos HTTP: Uso apropiado (200, 404, 500)

Timestamps: Todas las respuestas incluyen timestamps UTC

🔍 Depuración
Ver Estado Actual del Inventario
sql
-- Conéctate a la base de datos
psql -U postgres -d control1_3p_inventorydb

-- Ver todos los productos
SELECT * FROM products_stock ORDER BY product_id;

-- Ver productos con bajo stock
SELECT * FROM products_stock WHERE available_stock < 10;
Ver Mensajes en RabbitMQ
bash
# Usar rabbitmqadmin (si está instalado)
rabbitmqadmin list queues
rabbitmqadmin get queue=inventory_queue
✅ Inventory Service está listo para producción