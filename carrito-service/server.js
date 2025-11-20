const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3005;

const pool = new Pool({
  user: "cristhian",
  host: "localhost",
  database: "dae",
  password: "femayor9",
  port: 5432,
});

app.use(express.json());

// Helper functions
function respuestaExitosa(datos, mensaje = "Operación exitosa") {
  return { cod: 200, msj: mensaje, datos: datos };
}

function respuestaError(codigo, mensaje, datos = null) {
  return { cod: codigo, msj: mensaje, datos: datos };
}

// Ver carrito
app.get("/carrito/:us_id", async (req, res) => {
  try {
    const { us_id } = req.params;
    const result = await pool.query(
      `SELECT pu.*, p.pr_nombre, p.pr_precio, p.pr_imagen, p.ct_id
             FROM producto_usuario pu
             JOIN producto p USING(pr_id)
             WHERE pu.us_id = $1 AND pu.vt_id IS NULL`,
      [us_id]
    );
    res.json(respuestaExitosa(result.rows, "Carrito obtenido exitosamente"));
  } catch (error) {
    console.error("Error obteniendo carrito:", error);
    res.status(500).json(respuestaError(500, "Error obteniendo carrito"));
  }
});

// Agregar al carrito
app.post("/carrito", async (req, res) => {
  try {
    const { pu_cantidad, us_id, pr_id } = req.body;

    if (!pu_cantidad || !us_id || !pr_id) {
      return res
        .status(400)
        .json(
          respuestaError(
            400,
            "Datos incompletos: cantidad, usuario y producto son requeridos"
          )
        );
    }

    const existente = await pool.query(
      "SELECT * FROM producto_usuario WHERE us_id = $1 AND pr_id = $2 AND vt_id IS NULL",
      [us_id, pr_id]
    );

    if (existente.rows.length > 0) {
      const result = await pool.query(
        "UPDATE producto_usuario SET pu_cantidad = pu_cantidad + $1 WHERE pu_id = $2 RETURNING *",
        [pu_cantidad, existente.rows[0].pu_id]
      );
      res.json(
        respuestaExitosa(result.rows[0], "Cantidad actualizada en el carrito")
      );
    } else {
      const result = await pool.query(
        "INSERT INTO producto_usuario (pu_cantidad, us_id, pr_id) VALUES ($1, $2, $3) RETURNING *",
        [pu_cantidad, us_id, pr_id]
      );
      res.json(
        respuestaExitosa(result.rows[0], "Producto agregado al carrito")
      );
    }
  } catch (error) {
    console.error("Error agregando al carrito:", error);
    res.status(500).json(respuestaError(500, "Error agregando al carrito"));
  }
});

// Actualizar cantidad
app.patch("/carrito/:pu_id", async (req, res) => {
  try {
    const { pu_id } = req.params;
    const { pu_cantidad } = req.body;

    if (pu_cantidad <= 0) {
      return res
        .status(400)
        .json(respuestaError(400, "La cantidad debe ser mayor a 0"));
    }

    const result = await pool.query(
      "UPDATE producto_usuario SET pu_cantidad = $1 WHERE pu_id = $2 AND vt_id IS NULL RETURNING *",
      [pu_cantidad, pu_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json(respuestaError(404, "Producto no encontrado en el carrito"));
    }

    res.json(
      respuestaExitosa(result.rows[0], "Cantidad actualizada exitosamente")
    );
  } catch (error) {
    console.error("Error actualizando carrito:", error);
    res.status(500).json(respuestaError(500, "Error actualizando carrito"));
  }
});

// Eliminar del carrito
app.delete("/carrito/:pu_id", async (req, res) => {
  try {
    const { pu_id } = req.params;
    const result = await pool.query(
      "DELETE FROM producto_usuario WHERE pu_id = $1 AND vt_id IS NULL RETURNING *",
      [pu_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json(respuestaError(404, "Producto no encontrado en el carrito"));
    }

    res.json(
      respuestaExitosa(result.rows[0], "Producto eliminado del carrito")
    );
  } catch (error) {
    console.error("Error eliminando del carrito:", error);
    res.status(500).json(respuestaError(500, "Error eliminando del carrito"));
  }
});

// Ver compras
app.get("/compras/:us_id", async (req, res) => {
  try {
    const { us_id } = req.params;
    const result = await pool.query(
      `SELECT pu.*, p.pr_nombre, p.pr_precio, p.pr_imagen, p.ct_id, v.vt_fecha
             FROM producto_usuario pu
             JOIN producto p USING(pr_id)
             JOIN venta v ON pu.vt_id = v.vt_id
             WHERE pu.us_id = $1 AND pu.vt_id IS NOT NULL AND p.pr_eliminado IS NULL
             ORDER BY v.vt_fecha DESC`,
      [us_id]
    );
    res.json(
      respuestaExitosa(
        result.rows,
        "Historial de compras obtenido exitosamente"
      )
    );
  } catch (error) {
    console.error("Error obteniendo compras:", error);
    res.status(500).json(respuestaError(500, "Error obteniendo compras"));
  }
});

// Concretar compra
app.post("/compras", async (req, res) => {
  const client = await pool.connect();
  try {
    const { us_id } = req.body;

    if (!us_id) {
      return res.status(400).json(respuestaError(400, "Usuario requerido"));
    }

    await client.query("BEGIN");

    const carrito = await client.query(
      "SELECT * FROM producto_usuario WHERE us_id = $1 AND vt_id IS NULL",
      [us_id]
    );

    if (carrito.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json(respuestaError(400, "El carrito está vacío"));
    }

    const venta = await client.query(
      "INSERT INTO venta (vt_fecha) VALUES (CURRENT_DATE) RETURNING vt_id"
    );
    const vt_id = venta.rows[0].vt_id;

    await client.query(
      "UPDATE producto_usuario SET vt_id = $1 WHERE us_id = $2 AND vt_id IS NULL",
      [vt_id, us_id]
    );

    await client.query("COMMIT");
    res.json(respuestaExitosa({ vt_id: vt_id }, "Compra realizada con éxito"));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error procesando compra:", error);
    res.status(500).json(respuestaError(500, "Error procesando compra"));
  } finally {
    client.release();
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Servicio de carrito (Principal)" });
});

app.listen(PORT, () => {
  console.log(
    `Servicio de carrito (Principal) corriendo en http://localhost:${PORT}`
  );
});
