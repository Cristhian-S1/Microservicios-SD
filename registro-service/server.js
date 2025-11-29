const express = require("express");
const { createPool } = require("../shared/db");

const app = express();
const PORT = 3002;

const pool = new createPool();

app.use(express.json());

// Helper functions
function respuestaExitosa(datos, mensaje = "Operacion exitosa") {
  return { cod: 200, msj: mensaje, datos: datos };
}

function respuestaError(codigo, mensaje, datos = null) {
  return { cod: codigo, msj: mensaje, datos: datos };
}

app.post("/register", async (req, res) => {
  try {
    const {
      us_nombre,
      us_email,
      us_contrasena,
      us_fecha_nacimiento,
      us_icono,
    } = req.body;

    if (!us_nombre || !us_email || !us_contrasena) {
      return res
        .status(400)
        .json(respuestaError(400, "Nombre, email y contraseña son requeridos"));
    }

    // Verificar si el email ya existe
    const existente = await pool.query(
      "SELECT us_id FROM usuario WHERE us_email = $1",
      [us_email]
    );

    if (existente.rows.length > 0) {
      return res
        .status(409)
        .json(respuestaError(409, "El email ya está registrado"));
    }

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO usuario (us_nombre, us_email, us_contrasena, us_fecha_nacimiento, us_icono) 
             VALUES ($1, $2, $3, $4, $5) RETURNING us_id, us_nombre, us_email, us_icono, us_fecha_nacimiento`,
      [
        us_nombre,
        us_email,
        us_contrasena,
        us_fecha_nacimiento || null,
        us_icono || null,
      ]
    );

    res.json(
      respuestaExitosa(result.rows[0], "Usuario registrado exitosamente")
    );
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json(respuestaError(500, "Error en el servidor"));
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Servicio de registro" });
});

app.listen(PORT, () => {
  console.log(`Servicio de registro corriendo en http://localhost:${PORT}`);
});
