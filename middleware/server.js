const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Microservicios
const servicios = {
  login: { url: "http://localhost:3001", name: "Servicio de login" },
  registro: { url: "http://localhost:3002", name: "Servicio de registro" },

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

/*
Flujo
Para los servicios sin espejo simplemente realizamos un llamado con axios
Para los servicios con espejo realizamos una verificacion de su metodo /helth (todos los microservicios lo tienen) 
Si retorna una respuesta en 2ms entonces todo correcto y usa el principal
Si no retorna nada o no lo retorna en los 2ms entonces usara el espejo

Secuencia de funciones es 
1)servicioConEspejo recibe la ruta de quien este disponible (principal o espejo) y los llama mediante axios y json de configuracion
2)obtenerServicioActivoUrl(url) entrega la url de quien este activo, si el principal o el espejo
3)verificarServicio llama al servicio /health del microservicio y si no obtiene una respuesta en 2000 entonces no retorna
*/

// Health check para servicios con espejo
async function verificarServicio(servicioUrl) {
  try {
    const response = await axios.get(`${servicioUrl}/health`, {
      timeout: 2000,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Obtener URL activa (principal o espejo)
async function obtenerServicioActivoUrl(servicioNombre) {
  const servicio = servicios[servicioNombre];

  const principalActivo = await verificarServicio(servicio.principal.url);
  if (principalActivo) {
    console.log(`${servicio.name} - Usando servicio PRINCIPAL`);
    return servicio.principal.url;
  }

  const espejoActivo = await verificarServicio(servicio.espejo.url);
  if (espejoActivo) {
    console.log(`${servicio.name} - Principal caído, usando ESPEJO`);
    return servicio.espejo.url;
  }

  throw new Error(`Ambos servicios (${servicio.name}) están caídos`);
}

// Servicios con espejo
async function servicioConEspejo(
  req,
  res,
  servicioNombre,
  ruta,
  metodo = "GET"
) {
  try {
    const servicioUrl = await obtenerServicioActivoUrl(servicioNombre);
    const url = `${servicioUrl}${ruta}`;

    const config = {
      method: metodo,
      url: url,
      data: req.body,
      params: req.query,
      timeout: 5000,
    };

    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.error(`Error en ${servicioNombre}:`, error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "Error en el servicio",
    });
  }
}

// Servicios sin espejo
async function servicioSinEspejo(req, res, servicioUrl, ruta, metodo = "GET") {
  try {
    const url = `${servicioUrl}${ruta}`;

    const config = {
      method: metodo,
      url: url,
      data: req.body,
      params: req.query,
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

//--------------Rutas------------------------

// Auth
app.post("/api/auth/login", (req, res) =>
  servicioSinEspejo(req, res, servicios.login.url, "/login", "POST")
);

app.post("/api/auth/register", (req, res) =>
  servicioSinEspejo(req, res, servicios.registro.url, "/register", "POST")
);

// Productos con espejo
app.get("/api/productos", (req, res) =>
  servicioConEspejo(req, res, "productos", "/productos", "GET")
);

app.get("/api/categorias", (req, res) =>
  servicioConEspejo(req, res, "productos", "/categorias", "GET")
);

app.get("/api/productos/categoria/:ct_id", (req, res) =>
  servicioConEspejo(
    req,
    res,
    "productos",
    `/productos/categoria/${req.params.ct_id}`,
    "GET"
  )
);

app.post("/api/admin/productos", (req, res) =>
  servicioConEspejo(req, res, "productos", "/admin/productos", "POST")
);

app.patch("/api/admin/productos/:pr_id", (req, res) =>
  servicioConEspejo(
    req,
    res,
    "productos",
    `/admin/productos/${req.params.pr_id}`,
    "PATCH"
  )
);

app.delete("/api/admin/productos/:pr_id", (req, res) =>
  servicioConEspejo(
    req,
    res,
    "productos",
    `/admin/productos/${req.params.pr_id}`,
    "DELETE"
  )
);

app.post("/api/admin/categorias", (req, res) =>
  servicioConEspejo(req, res, "productos", "/admin/categorias", "POST")
);

app.patch("/api/admin/categorias/:ct_id", (req, res) =>
  servicioConEspejo(
    req,
    res,
    "productos",
    `/admin/categorias/${req.params.ct_id}`,
    "PATCH"
  )
);

app.delete("/api/admin/categorias/:ct_id", (req, res) =>
  servicioConEspejo(
    req,
    res,
    "productos",
    `/admin/categorias/${req.params.ct_id}`,
    "DELETE"
  )
);

// Carrito con espejo
app.get("/api/carrito/:us_id", (req, res) =>
  servicioConEspejo(req, res, "carrito", `/carrito/${req.params.us_id}`, "GET")
);

app.post("/api/carrito", (req, res) =>
  servicioConEspejo(req, res, "carrito", "/carrito", "POST")
);

app.patch("/api/carrito/:pu_id", (req, res) =>
  servicioConEspejo(
    req,
    res,
    "carrito",
    `/carrito/${req.params.pu_id}`,
    "PATCH"
  )
);

app.delete("/api/carrito/:pu_id", (req, res) =>
  servicioConEspejo(
    req,
    res,
    "carrito",
    `/carrito/${req.params.pu_id}`,
    "DELETE"
  )
);

// Compras
app.get("/api/compras/:us_id", (req, res) =>
  servicioConEspejo(req, res, "carrito", `/compras/${req.params.us_id}`, "GET")
);

// ** Checkout / finalizar compra **
app.post("/api/compras", (req, res) =>
  servicioConEspejo(req, res, "carrito", "/finalizar", "POST")
);

// Verificación de estado
app.get("/health", (req, res) => {
  res.json({ status: "ok", servicio: "Middleware/API Gateway" });
});

// Estado de los servicios
app.get("/api/servicios/status", async (req, res) => {
  const status = {
    login: await verificarServicio(servicios.login.url),
    registro: await verificarServicio(servicios.registro.url),
    productos: {
      principal: await verificarServicio(servicios.productos.principal.url),
      espejo: await verificarServicio(servicios.productos.espejo.url),
    },
    carrito: {
      principal: await verificarServicio(servicios.carrito.principal.url),
      espejo: await verificarServicio(servicios.carrito.espejo.url),
    },
  };
  res.json(status);
});

// A la escucha
app.listen(PORT, () => {
  console.log(`Middleware/API Gateway corriendo en http://localhost:${PORT}`);
  console.log(
    `Estado de servicios: http://localhost:${PORT}/api/servicios/status`
  );
});
