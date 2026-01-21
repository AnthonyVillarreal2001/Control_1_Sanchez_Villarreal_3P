# 🏗️ Infrastructure

## 📋 Descripción
Configuración de infraestructura para el sistema de e-commerce con microservicios. Incluye Docker Compose para RabbitMQ y configuración de conexiones a bases de datos.

## 🐳 Docker Compose

### Archivo: docker-compose.yml
```yaml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"    # AMQP protocol
      - "15672:15672"  # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  rabbitmq_data:
```
## 🚀 Comandos Rápidos
## Iniciar RabbitMQ
```bash
docker-compose up -d
```
## 📊 Puertos y URLs
Servicio	Puerto	URL	Credenciales
RabbitMQ (AMQP)	5672	amqp://localhost:5672	admin/admin123
RabbitMQ Management	15672	http://localhost:15672	admin/admin123
## 🔧 Configuración de RabbitMQ
## Exchange Configurado
- Nombre: order_exchange

- Tipo: direct

- Durable: true

- Auto-delete: false

## Queues Configuradas
- **inventory**