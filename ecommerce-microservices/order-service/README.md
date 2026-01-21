# 🛍️ Order Service

## 📋 Descripción
Microservicio responsable de la gestión de pedidos en el sistema de e-commerce. Se encarga de crear pedidos, manejar su ciclo de vida y comunicarse de forma asíncrona con el Inventory Service a través de RabbitMQ.

## 🎯 Funcionalidades
- Crear nuevos pedidos
- Consultar estado de pedidos
- Publicar eventos OrderCreated en RabbitMQ
- Consumir eventos StockReserved/StockRejected
- Actualizar estado de pedidos basado en respuestas de inventario

## 🏗️ Arquitectura Interna
```bash
Order Service
├── Controllers (REST API)
├── Models (PostgreSQL)
├── Services (Lógica de negocio)
└── RabbitMQ (Publicador/Consumidor)
```

## 🚀 Configuración Rápida

### 1. Instalar Dependencias
```bash
npm install

```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
```
### 3. Editar Archivo .env segun tus credenciales
```bash
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=/*nombre de la base de datos de order*/
DB_USER=/*usuario*/
DB_PASSWORD=/*contraseña*/
RABBITMQ_URL=amqp://admin:admin123@localhost:5673
ORDER_EXCHANGE=order_exchange
INVENTORY_QUEUE=inventory_queue
RESPONSE_QUEUE=order_response_queue
```
### 4. Ejecutar el Servicio
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```
## 📡 Endpoints Disponibles
POST /api/v1/orders

## 🗄️ Estructura de Base de Datos
## Tabla: orders
```bash
CREATE TABLE orders (
    order_id UUID PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```
## Tabla: order_items
```bash
CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
```
## 🐇 Configuración RabbitMQ
## Publicación de Eventos
- Exchange: order_exchange

- Routing Key: order.created

- Mensaje: Evento OrderCreated

## Consumo de Eventos
- Queue: order_response_queue

- Routing Key: inventory.response

- Mensajes: StockReserved, StockRejected

## 📊 Estados del Pedido

| Estado     | Descripción                              |
|------------|------------------------------------------|
| PENDING    | Esperando verificación de inventario     |
| CONFIRMED  | Pedido confirmado (stock disponible)     |
| CANCELLED  | Pedido cancelado (stock insuficiente)    |
## 📝 Notas de Implementación
- UUIDs: Todos los orderId son generados como UUID v4

- Transacciones: Las operaciones de base de datos son atómicas

- Reconexión: Reconexión automática a RabbitMQ en caso de fallos

- Persistencia: Mensajes RabbitMQ son persistentes

- Escalabilidad: Puede ejecutarse en múltiples instancias

## 🏷️ Convenciones
- Variables de entorno: Todas en mayúsculas con guión bajo

- Endpoints: Versión en la ruta (/api/v1/)

- Códigos HTTP: Uso apropiado de códigos de estado

- Logs: Formato estructurado con timestamps

## ✅ Order Service está listo para producción