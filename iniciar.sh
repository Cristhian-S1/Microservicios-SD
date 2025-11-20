#!/bin/bash
echo "============================================"
echo "Iniciando todos los microservicios..."
echo "============================================"

(
  cd middleware && npm start
) &
sleep 2

(
  cd auth-service && npm start
) &
sleep 2

(
  cd productos-service && npm start
) &
sleep 2

(
  cd productos-service-espejo && npm start
) &
sleep 2

(
  cd carrito-service && npm start
) &
sleep 2

(
  cd carrito-service-espejo && npm start
) &

echo ""
echo "============================================"
echo "Todos los servicios iniciados"
echo "============================================"
echo "Middleware: http://localhost:3000"
echo "Auth: http://localhost:3001"
echo "Productos: http://localhost:3003"
echo "Productos Espejo: http://localhost:3004"
echo "Carrito: http://localhost:3005"
echo "Carrito Espejo: http://localhost:3006"
echo "============================================"
