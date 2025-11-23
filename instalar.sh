#!/bin/bash
echo "Instalando dependencias en todos los servicios..."

(
  cd middleware && npm install && npm install dotenv
)

(
  cd auth-service && npm install && npm install dotenv
)

(
  cd productos-service && npm install && npm install dotenv
)

(
  cd productos-service-espejo && npm install && npm install dotenv
)

(
  cd carrito-service && npm install && npm install dotenv
)

(
  cd carrito-service-espejo && npm install && npm install dotenv
)

echo ""
echo "Dependencias instaladas en todos los servicios!"
