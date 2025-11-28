import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CartService {
  private apiUrl = "http://localhost:3000/api";
  private carrito: any[] = [];

  constructor(private http: HttpClient) {
    this.cargarDesdeLocalStorage();
  }

  checkout(us_id: number, productos: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/compras`, { us_id, productos });
  }

  private guardarEnLocalStorage() {
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
  }

  private cargarDesdeLocalStorage() {
    const data = localStorage.getItem("carrito");
    this.carrito = data ? JSON.parse(data) : [];
  }

  agregarProducto(producto: any) {
    this.carrito.push(producto);
    this.guardarEnLocalStorage();
  }

  /** 🔥 Agrupa los productos repetidos */
  obtenerCarritoAgrupado() {
    const mapa = new Map();

    for (const p of this.carrito) {
      if (!mapa.has(p.pr_id)) {
        mapa.set(p.pr_id, {
          ...p,
          cantidad: 1,
          total: p.pr_precio,
        });
      } else {
        const item = mapa.get(p.pr_id);
        item.cantidad++;
        item.total = item.cantidad * item.pr_precio;
      }
    }

    return Array.from(mapa.values());
  }

  obtenerTotalGeneral() {
    return this.obtenerCarritoAgrupado().reduce(
      (acc, item) => acc + item.total,
      0
    );
  }

  limpiarCarrito() {
    this.carrito = [];
    this.guardarEnLocalStorage();
  }
  obtenerCarrito() {
    return this.carrito;
  }
}
