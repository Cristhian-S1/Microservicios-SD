import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CartService } from "../../services/cart.service"; // Asegúrate de que la ruta sea correcta

@Component({
  selector: "app-carrito",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./carrito.component.html",
  styleUrls: ["./carrito.component.css"],
})
export class CarritoComponent {
  carritoOriginal: any[] = [];
  carritoAgrupado: any[] = [];
  totalGeneral: number = 0;

  // ID del usuario actual (puede venir de AuthService)
  us_id: number = 1;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cargarDesdeLocalStorage();
    this.agruparCarrito();
  }

  cargarDesdeLocalStorage() {
    this.carritoOriginal = this.cartService.obtenerCarrito();

    //const data = localStorage.getItem("carrito");
    //this.carritoOriginal = data ? JSON.parse(data) : [];
  }

  agruparCarrito() {
    const mapa = new Map<number, any>();

    for (const p of this.carritoOriginal) {
      if (!mapa.has(p.pr_id)) {
        mapa.set(p.pr_id, {
          pr_id: p.pr_id,
          nombre: p.pr_nombre,
          precio: p.pr_precio,
          imagen: p.pr_imagen,
          cantidad: 1,
          total: p.pr_precio,
        });
      } else {
        const item = mapa.get(p.pr_id);
        item.cantidad++;
        item.total = item.cantidad * item.precio;
      }
    }

    this.carritoAgrupado = Array.from(mapa.values());
    this.totalGeneral = this.carritoAgrupado.reduce(
      (acc, item) => acc + item.total,
      0
    );
  }

  limpiarCarrito() {
    localStorage.removeItem("carrito");
    this.cartService.limpiarCarrito();
    this.carritoOriginal = [];
    this.carritoAgrupado = [];
    this.totalGeneral = 0;
  }

  checkout() {
    if (this.carritoAgrupado.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    // Preparar el array de productos con id y cantidad
    const productos = this.carritoAgrupado.map((item) => ({
      pr_id: item.pr_id,
      pu_cantidad: item.cantidad,
    }));

    // Llamada al servicio
    this.cartService.checkout(1, productos).subscribe({
      next: (res: any) => {
        console.log("Respuesta del servidor:", res);
        alert("Compra realizada con éxito!");
        this.limpiarCarrito(); // Limpia carrito tras la compra
      },
      error: (err) => {
        console.error("Error al concretar la compra", err);
        alert("Error al realizar la compra. Intenta nuevamente.");
      },
    });
  }
}
