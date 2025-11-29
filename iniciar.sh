#!/bin/bash
echo "============================================"
echo "Iniciando todos los microservicios..."
echo "============================================"

(
  cd middleware && npm run dev
) &
sleep 2

(
  cd login-service && npm run dev
) &
sleep 2

(
  cd productos-service && npm run dev
) &
sleep 2

(
  cd registro-service && npm run dev
) &
sleep 2

(
  cd productos-service-espejo && npm run dev
) &
sleep 2

(
  cd carrito-service && npm run dev
) &
sleep 2

(
  cd carrito-service-espejo && npm run dev
) &
sleep 2

echo ""
echo "============================================"
echo "Todos los servicios iniciados"
echo "============================================"
echo "Middleware: http://localhost:3000"
echo "Login: http://localhost:3001"
echo "Registro: http://localhost:3002"
echo "Productos: http://localhost:3003"
echo "Productos Espejo: http://localhost:3004"
echo "Carrito: http://localhost:3005"
echo "Carrito Espejo: http://localhost:3006"
echo "============================================"
