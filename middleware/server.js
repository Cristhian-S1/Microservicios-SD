const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//Microservicios
const services = {
  auth: { url: "http://localhost:3001", name: "Servicio de auth" },
  productos: {
    principal: { url: "http://localhost:3003", active: true },
    espejo: { url: "http://localhost:3004", active: true },
    name: "Servicio de productos",
  },
  carrito: {
    principal: { url: "http://localhost:3005", active: true },
    espejo: { url: "http://localhost:3006", active: true },
    name: "Servicio de carrito",
  },
};

// Health check para servicios con espejo
async function checkServiceHealth(serviceUrl) {
  try {
    const response = await axios.get(`${serviceUrl}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Obtener URL activa (principal o espejo)
async function getActiveServiceUrl(serviceName) {
  const service = services[serviceName];

  // Verificar servicio principal
  const principalActive = await checkServiceHealth(service.principal.url);
  if (principalActive) {
    console.log(`${service.name} - Usando servicio PRINCIPAL`);
    return service.principal.url;
  }

  // Si falla, usamos el espejo(se consigue bajando el principal)
  const espejoActive = await checkServiceHealth(service.espejo.url);
  if (espejoActive) {
    console.log(`${service.name} - Principal caido, usando ESPEJO`);
    return service.espejo.url;
  }

  throw new Error(`Ambos servicios (${service.name}) están caídos`);
}

// Proxy generico para servicios con espejo
async function proxyToServiceWithMirror(
  req,
  res,
  serviceName,
  path,
  method = "GET"
) {
  try {
    const serviceUrl = await getActiveServiceUrl(serviceName);
    const url = `${serviceUrl}${path}`;

    const config = {
      method: method,
      url: url,
      data: req.body,
      timeout: 5000,
    };

    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.error(`Error en ${serviceName}:`, error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "Error en el servicio",
    });
  }
}

// Proxy genérico para servicios sin espejo
async function proxyToService(req, res, serviceUrl, path, method = "GET") {
  try {
    const url = `${serviceUrl}${path}`;

    const config = {
      method: method,
      url: url,
      data: req.body,
      timeout: 5000,
    };

    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.error(`Error en servicio:`, error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "Error en el servicio",
    });
  }
}

//login
app.post("/api/auth/login", (req, res) =>
  proxyToService(req, res, services.auth.url, "/login", "POST")
);

//register
app.post("/api/auth/register", (req, res) =>
  proxyToService(req, res, services.auth.url, "/register", "POST")
);

//Productos con espejo
app.get("/api/productos", (req, res) =>
  proxyToServiceWithMirror(req, res, "productos", "/productos", "GET")
);

app.get("/api/categorias", (req, res) =>
  proxyToServiceWithMirror(req, res, "productos", "/categorias", "GET")
);

app.get("/api/productos/categoria/:ct_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "productos",
    `/productos/categoria/${req.params.ct_id}`,
    "GET"
  )
);

app.post("/api/admin/productos", (req, res) =>
  proxyToServiceWithMirror(req, res, "productos", "/admin/productos", "POST")
);

app.patch("/api/admin/productos/:pr_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "productos",
    `/admin/productos/${req.params.pr_id}`,
    "PATCH"
  )
);

app.delete("/api/admin/productos/:pr_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "productos",
    `/admin/productos/${req.params.pr_id}`,
    "DELETE"
  )
);

app.post("/api/admin/categorias", (req, res) =>
  proxyToServiceWithMirror(req, res, "productos", "/admin/categorias", "POST")
);

app.patch("/api/admin/categorias/:ct_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "productos",
    `/admin/categorias/${req.params.ct_id}`,
    "PATCH"
  )
);

app.delete("/api/admin/categorias/:ct_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "productos",
    `/admin/categorias/${req.params.ct_id}`,
    "DELETE"
  )
);

//Carrito con espejo
app.get("/api/carrito/:us_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "carrito",
    `/carrito/${req.params.us_id}`,
    "GET"
  )
);

app.post("/api/carrito", (req, res) =>
  proxyToServiceWithMirror(req, res, "carrito", "/carrito", "POST")
);

app.patch("/api/carrito/:pu_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "carrito",
    `/carrito/${req.params.pu_id}`,
    "PATCH"
  )
);

app.delete("/api/carrito/:pu_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "carrito",
    `/carrito/${req.params.pu_id}`,
    "DELETE"
  )
);

app.get("/api/compras/:us_id", (req, res) =>
  proxyToServiceWithMirror(
    req,
    res,
    "carrito",
    `/compras/${req.params.us_id}`,
    "GET"
  )
);

app.post("/api/compras", (req, res) =>
  proxyToServiceWithMirror(req, res, "carrito", "/compras", "POST")
);

//verificacion
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Middleware/API Gateway" });
});

//estado de servicios
app.get("/api/services/status", async (req, res) => {
  const status = {
    auth: await checkServiceHealth(services.auth.url),
    productos: {
      principal: await checkServiceHealth(services.productos.principal.url),
      espejo: await checkServiceHealth(services.productos.espejo.url),
    },
    carrito: {
      principal: await checkServiceHealth(services.carrito.principal.url),
      espejo: await checkServiceHealth(services.carrito.espejo.url),
    },
  };
  res.json(status);
});

app.listen(PORT, () => {
  console.log(`Middleware/API Gateway corriendo en http://localhost:${PORT}`);
  console.log(
    `Estado de servicios: http://localhost:${PORT}/api/services/status`
  );
});
