# Control_1_Sanchez_Villarreal_3P
E-Commerce Microservices con RabbitMQ
📋 Descripción
Implementación de un sistema de e-commerce basado en microservicios que se comunican de forma asíncrona mediante RabbitMQ. El sistema está compuesto por dos microservicios independientes: Order Service e Inventory Service, que procesan pedidos de manera eficiente, escalable y tolerante a fallos.

🎯 Objetivo
Diseñar e implementar un escenario de e-commerce donde:

Order Service crea y gestiona pedidos

Inventory Service verifica y actualiza inventario

La comunicación es asíncrona mediante RabbitMQ

El sistema es escalable y tolerante a fallos

🏗️ Arquitectura
text
┌─────────────┐     HTTP     ┌─────────────┐
│   Cliente   │─────────────▶│ Order Service│
└─────────────┘              └──────┬──────┘
                                    │
                                    │ RabbitMQ
                                    │ (OrderCreated)
                                    ▼
                             ┌─────────────┐
                             │   RabbitMQ  │
                             │   Broker    │
                             └──────┬──────┘
                                    │
                                    │ RabbitMQ
                    ┌───────────────┼───────────────┐
                    │               │               │
            (OrderCreated)  (StockReserved) (StockRejected)
                    │               │               │
            ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
            │ Inventory   │ │ Order       │ │ Order       │
            │ Service     │ │ Service     │ │ Service     │
            └─────────────┘ └─────────────┘ └─────────────┘
📁 Estructura del Proyecto
text
ecommerce-microservices/
├── order-service/              # Microservicio de Pedidos
├── inventory-service/          # Microservicio de Inventario
├── infrastructure/             # Infraestructura Docker
├── postman/                   # Colecciones de pruebas
└── README.md                  # Este archivo
⚙️ Requisitos Previos
Node.js (v16 o superior)

PostgreSQL (v14 o superior)

Docker y Docker Compose

Postman (para pruebas)

Git (para clonar el repositorio)

🚀 Instalación Rápida
1. Clonar el Repositorio
bash
git clone https://github.com/tu-usuario/ecommerce-microservices.git
cd ecommerce-microservices
2. Crear Bases de Datos PostgreSQL
sql
-- Conéctate a PostgreSQL
psql -U postgres -h localhost

-- Ejecuta estos comandos:
CREATE DATABASE control1_3p_orderdb;
CREATE DATABASE control1_3p_inventorydb;
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
▶️ Ejecutar el Sistema
Terminal 1: RabbitMQ
bash
cd infrastructure
docker-compose up
Terminal 2: Order Service
bash
cd order-service
npm run dev
Terminal 3: Inventory Service
bash
cd inventory-service
npm run dev
🔧 Configurar Postman
Importar Colección: postman/ecommerce-microservices-postman-collection.json

Importar Entorno: postman/ecommerce-microservices-environment.json

Seleccionar entorno: "E-Commerce Microservices Environment"

📊 Pruebas Rápidas
Crear Pedido Exitoso
bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
    "items": [{"productId": "P-001", "quantity": 2}],
    "shippingAddress": {
      "country": "EC",
      "city": "Quito",
      "street": "Av. Amazonas",
      "postalCode": "170135"
    },
    "paymentReference": "pay_test_001"
  }'
Consultar Estado del Pedido
bash
curl http://localhost:3001/api/v1/orders/{orderId}
Verificar Stock
bash
curl http://localhost:3002/api/v1/products/P-001/stock
🔍 Monitoreo
Order Service: http://localhost:3001

Inventory Service: http://localhost:3002

RabbitMQ Management: http://localhost:15672 (admin/admin123)

📚 Endpoints
Order Service (PORT: 3001)
POST /api/v1/orders - Crear pedido

GET /api/v1/orders/{orderId} - Consultar pedido

Inventory Service (PORT: 3002)
GET /api/v1/products - Listar productos

GET /api/v1/products/{productId}/stock - Consultar stock

🐛 Solución de Problemas Comunes
Error de Conexión a PostgreSQL
bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql
Error de Conexión a RabbitMQ
bash
# Reiniciar RabbitMQ
cd infrastructure
docker-compose restart
Servicios no actualizan estado
Verificar logs de los servicios

Revisar RabbitMQ Management

Verificar que las colas estén configuradas

📝 Datos de Prueba
Productos disponibles por defecto:

P-001: 100 unidades

P-777: 5 unidades

a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d: 25 unidades

b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f: 10 unidades

🔄 Reiniciar Todo el Sistema
bash
# Detener servicios
cd order-service && npm stop
cd inventory-service && npm stop
cd infrastructure && docker-compose down

# Iniciar servicios
cd infrastructure && docker-compose up -d
cd order-service && npm run dev
cd inventory-service && npm run dev
📄 Licencia
MIT License

🆘 Soporte
Si encuentras problemas:

Revisa la sección de Solución de Problemas

Verifica los logs

Abre un issue en GitHub