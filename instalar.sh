#!/bin/bash
echo "Instalando dependencias en todos los servicios..."

(
  cd middleware && npm install
)

(
  cd auth-service && npm install
)

(
  cd productos-service && npm install
)

(
  cd productos-service-espejo && npm install
)

(
  cd carrito-service && npm install
)

(
  cd carrito-service-espejo && npm install
)

echo ""
echo "Dependencias instaladas en todos los servicios!"
