const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3004;

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

// Obtener todos los productos
app.get("/productos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM producto WHERE pr_eliminado IS NULL ORDER BY pr_id"
    );
    res.json(respuestaExitosa(result.rows, "Productos obtenidos exitosamente"));
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json(respuestaError(500, "Error obteniendo productos"));
  }
});

// Obtener categorías
app.get("/categorias", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categoria WHERE ct_eliminado IS NULL ORDER BY ct_id"
    );
    res.json(
      respuestaExitosa(result.rows, "Categorías obtenidas exitosamente")
    );
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    res.status(500).json(respuestaError(500, "Error obteniendo categorías"));
  }
});

// Obtener productos por categoría
app.get("/productos/categoria/:ct_id", async (req, res) => {
  try {
    const { ct_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM producto WHERE ct_id = $1 AND pr_eliminado IS NULL ORDER BY pr_id",
      [ct_id]
    );
    res.json(
      respuestaExitosa(
        result.rows,
        `Productos de categoría ${ct_id} obtenidos exitosamente`
      )
    );
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json(respuestaError(500, "Error obteniendo productos"));
  }
});

// Crear producto
app.post("/admin/productos", async (req, res) => {
  try {
    const { pr_nombre, pr_precio, pr_imagen, ct_id } = req.body;

    if (!pr_nombre || !pr_precio || !ct_id) {
      return res
        .status(400)
        .json(
          respuestaError(
            400,
            "Datos incompletos: nombre, precio y categoría son requeridos"
          )
        );
    }

    const result = await pool.query(
      "INSERT INTO producto (pr_nombre, pr_precio, pr_imagen, ct_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [pr_nombre, pr_precio, pr_imagen || null, ct_id]
    );

    res.json(respuestaExitosa(result.rows[0], "Producto creado exitosamente"));
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json(respuestaError(500, "Error creando producto"));
  }
});

// Actualizar producto
app.patch("/admin/productos/:pr_id", async (req, res) => {
  try {
    const { pr_id } = req.params;
    const campos = req.body;

    const camposPermitidos = ["pr_nombre", "pr_precio", "pr_imagen", "ct_id"];
    const updates = [];
    const valores = [];
    let contador = 1;

    for (const campo of camposPermitidos) {
      if (campos[campo] !== undefined) {
        updates.push(`${campo} = $${contador}`);
        valores.push(campos[campo]);
        contador++;
      }
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json(respuestaError(400, "No hay campos para actualizar"));
    }

    valores.push(pr_id);
    const query = `UPDATE producto SET ${updates.join(
      ", "
    )} WHERE pr_id = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json(respuestaError(404, "Producto no encontrado"));
    }

    res.json(
      respuestaExitosa(result.rows[0], "Producto actualizado exitosamente")
    );
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json(respuestaError(500, "Error actualizando producto"));
  }
});

// Eliminar producto
app.delete("/admin/productos/:pr_id", async (req, res) => {
  try {
    const { pr_id } = req.params;
    const result = await pool.query(
      "UPDATE producto SET pr_eliminado = 1 WHERE pr_id = $1 RETURNING *",
      [pr_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json(respuestaError(404, "Producto no encontrado"));
    }

    res.json(
      respuestaExitosa(result.rows[0], "Producto eliminado exitosamente")
    );
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json(respuestaError(500, "Error eliminando producto"));
  }
});

// Crear categoría
app.post("/admin/categorias", async (req, res) => {
  try {
    const { ct_nombre } = req.body;

    if (!ct_nombre) {
      return res
        .status(400)
        .json(respuestaError(400, "Nombre de categoría requerido"));
    }

    const result = await pool.query(
      "INSERT INTO categoria (ct_nombre) VALUES ($1) RETURNING *",
      [ct_nombre]
    );

    res.json(respuestaExitosa(result.rows[0], "Categoría creada exitosamente"));
  } catch (error) {
    console.error("Error creando categoría:", error);
    res.status(500).json(respuestaError(500, "Error creando categoría"));
  }
});

// Actualizar categoría
app.patch("/admin/categorias/:ct_id", async (req, res) => {
  try {
    const { ct_id } = req.params;
    const { ct_nombre } = req.body;

    if (!ct_nombre) {
      return res
        .status(400)
        .json(respuestaError(400, "Nombre de categoría requerido"));
    }

    const result = await pool.query(
      "UPDATE categoria SET ct_nombre = $1 WHERE ct_id = $2 RETURNING *",
      [ct_nombre, ct_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json(respuestaError(404, "Categoría no encontrada"));
    }

    res.json(
      respuestaExitosa(result.rows[0], "Categoría actualizada exitosamente")
    );
  } catch (error) {
    console.error("Error actualizando categoría:", error);
    res.status(500).json(respuestaError(500, "Error actualizando categoría"));
  }
});

// Eliminar categoría
app.delete("/admin/categorias/:ct_id", async (req, res) => {
  try {
    const { ct_id } = req.params;
    const result = await pool.query(
      "UPDATE categoria SET ct_eliminado = 1 WHERE ct_id = $1 RETURNING *",
      [ct_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json(respuestaError(404, "Categoría no encontrada"));
    }

    res.json(
      respuestaExitosa(result.rows[0], "Categoría eliminada exitosamente")
    );
  } catch (error) {
    console.error("Error eliminando categoría:", error);
    res.status(500).json(respuestaError(500, "Error eliminando categoría"));
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Productos (Espejo)" });
});

app.listen(PORT, () => {
  console.log(`Productos (Espejo) corriendo en http://localhost:${PORT}`);
});
