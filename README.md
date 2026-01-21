# 🛒 E-Commerce Microservices con RabbitMQ

## 📚 Descripción del Proyecto
Implementación de un sistema de e-commerce basado en microservicios que se comunican de forma asíncrona mediante RabbitMQ, diseñado para ser escalable, tolerante a fallos y eficiente en el procesamiento de pedidos.

## 🎯 Objetivos del Proyecto
- **Objetivo General**: Diseñar e implementar un escenario de e-commerce basado en microservicios con comunicación asíncrona
- **Objetivos Específicos**:
  - Implementar Order Service para crear y gestionar pedidos
  - Implementar Inventory Service para verificar y actualizar inventario
  - Configurar RabbitMQ con exchanges y colas para garantizar robustez
  - Modelar el flujo de negocio completo mediante mensajería asíncrona

## 🏗️ Arquitectura del Sistema
┌─────────────────┐ HTTP ┌─────────────────┐
│ Cliente ├───────────►│ Order Service │
└─────────────────┘ └────────┬────────┘
│
│ RabbitMQ (OrderCreated)
▼
┌─────────────────┐
│ RabbitMQ │
│ Broker │
└────────┬────────┘
│
┌───────────────────┼───────────────────┐
│ │ │
┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
│ Inventory │ │ Order Service │ │ Order Service │
│ Service │ │ (Consume │ │ (Consume │
│ (Consume │ │ StockReserved) │ │ StockRejected) │
│ OrderCreated) │ │ │ │ │
└─────────────────┘ └─────────────────┘ └─────────────────┘

text

## 📁 Estructura del Repositorio
ecommerce-microservices/
├── order-service/ # Microservicio de Pedidos
├── inventory-service/ # Microservicio de Inventario
├── infrastructure/ # Configuración de Infraestructura
├── postman/ # Colecciones de pruebas Postman
└── README.md # Este archivo

text

## ⚙️ Requisitos del Sistema
- **Node.js 16+**
- **PostgreSQL 14+**
- **Docker & Docker Compose**
- **Postman** (para pruebas)

## 🚀 Guía de Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd ecommerce-microservices
2. Configurar Bases de Datos PostgreSQL
sql
-- Conéctate a PostgreSQL
psql -U postgres -h localhost

-- Crear bases de datos
CREATE DATABASE control1_3p_orderdb;
CREATE DATABASE control1_3p_inventorydb;

-- Verificar creación
\l
3. Iniciar RabbitMQ
bash
cd infrastructure
docker-compose up -d
4. Configurar Order Service
bash
cd order-service
cp .env.example .env
# Editar .env con tus credenciales
npm install
5. Configurar Inventory Service
bash
cd inventory-service
cp .env.example .env
# Editar .env con tus credenciales
npm install
▶️ Ejecutar la Aplicación
Terminal 1 - RabbitMQ
bash
cd infrastructure
docker-compose up
Terminal 2 - Order Service
bash
cd order-service
npm run dev
Terminal 3 - Inventory Service
bash
cd inventory-service
npm run dev
🔍 Verificar Instalación
Order Service: http://localhost:3001/api/v1/orders

Inventory Service: http://localhost:3002/api/v1/products

RabbitMQ Management: http://localhost:15672

Usuario: admin

Contraseña: admin123

📊 Flujo de Trabajo del Sistema
Caso 1: Pedido Confirmado
text
1. Cliente → POST /orders
2. Order Service crea pedido (PENDING)
3. Order Service publica OrderCreated en RabbitMQ
4. Inventory Service consume OrderCreated
5. Inventory Service verifica stock → StockReserved
6. Order Service consume StockReserved
7. Order Service actualiza pedido a CONFIRMED
8. Cliente puede consultar estado (CONFIRMED)
Caso 2: Pedido Cancelado
text
1. Cliente → POST /orders
2. Order Service crea pedido (PENDING)
3. Order Service publica OrderCreated en RabbitMQ
4. Inventory Service consume OrderCreated
5. Inventory Service verifica stock → StockRejected
6. Order Service consume StockRejected
7. Order Service actualiza pedido a CANCELLED
8. Cliente puede consultar estado (CANCELLED)
🧪 Pruebas con Postman
Importar los archivos desde la carpeta postman/:

ecommerce-microservices-postman-collection.json

ecommerce-microservices-environment.json

📡 Endpoints Principales
Order Service
POST /api/v1/orders - Crear nuevo pedido

GET /api/v1/orders/{orderId} - Consultar estado del pedido

Inventory Service
GET /api/v1/products/{productId}/stock - Consultar stock de producto

GET /api/v1/products - Listar todos los productos

🔧 Variables de Entorno
Order Service (.env)
env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=control1_3p_orderdb
DB_USER=postgres
DB_PASSWORD=1234
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
ORDER_EXCHANGE=order_exchange
INVENTORY_QUEUE=inventory_queue
RESPONSE_QUEUE=order_response_queue
Inventory Service (.env)
env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=control1_3p_inventorydb
DB_USER=postgres
DB_PASSWORD=1234
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
ORDER_EXCHANGE=order_exchange
INVENTORY_QUEUE=inventory_queue
RESPONSE_QUEUE=order_response_queue
🐛 Solución de Problemas Comunes
Error: "Cannot connect to PostgreSQL"
bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar credenciales en archivos .env
Error: "Cannot connect to RabbitMQ"
bash
# Reiniciar contenedor de RabbitMQ
cd infrastructure
docker-compose restart rabbitmq

# Verificar logs
docker logs rabbitmq
Error: "Services not updating"
Verificar logs de ambos servicios

Revisar RabbitMQ Management en http://localhost:15672

Verificar que las colas estén configuradas

📊 Datos de Prueba Iniciales
El sistema incluye estos productos por defecto:

Product ID	Stock Disponible	Stock Reservado
a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d	25	0
b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f	10	0
P-001	100	0
P-777	5	0
🔄 Comandos Útiles
Reiniciar todo el sistema
bash
# Detener todo
cd order-service && npm stop
cd inventory-service && npm stop
cd infrastructure && docker-compose down

# Iniciar todo
cd infrastructure && docker-compose up -d
cd order-service && npm run dev
cd inventory-service && npm run dev
Limpiar bases de datos
sql
-- Order DB
TRUNCATE TABLE orders, order_items RESTART IDENTITY;

-- Inventory DB
UPDATE products_stock 
SET available_stock = CASE 
    WHEN product_id = 'a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d' THEN 25
    WHEN product_id = 'b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f' THEN 10
    WHEN product_id = 'P-001' THEN 100
    WHEN product_id = 'P-777' THEN 5
    ELSE available_stock
END,
reserved_stock = 0;
📝 Estado del Pedido
Los pedidos pueden tener estos estados:

PENDING: Pedido creado, esperando verificación de inventario

CONFIRMED: Stock disponible, pedido confirmado

CANCELLED: Stock insuficiente, pedido cancelado

🎯 Características Implementadas
✅ Comunicación asíncrona con RabbitMQ
✅ Microservicios independientes
✅ Bases de datos PostgreSQL separadas
✅ Manejo de transacciones
✅ Reconexión automática
✅ Logs detallados
✅ Pruebas Postman incluidas
✅ Docker Compose para RabbitMQ
✅ UUIDs para todos los identificadores
✅ Flujo completo según especificaciones

📄 Licencia
Este proyecto está bajo la Licencia MIT.

👥 Autores
[Tu Nombre]

Universidad de las Fuerzas Armadas ESPE

Departamento de Ciencias de la Computación

Carrera de Software

Aplicaciones Distribuidas

📅 Fecha
21 de enero de 2026