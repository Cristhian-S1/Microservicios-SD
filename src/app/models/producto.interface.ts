export interface Producto {
  pr_id: number;
  pr_nombre: string;
  pr_precio: number;
  pr_imagen: string | null;
  pr_eliminado: number | null;
  ct_id: number;
}
