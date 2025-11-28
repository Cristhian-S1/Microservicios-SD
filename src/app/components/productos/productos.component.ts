import { Component, inject, OnInit } from "@angular/core";
import { ProductoService } from "../../services/producto.service";
import { Producto } from "../../models/producto.interface";
import { CommonModule } from "@angular/common";
import { Categoria } from "../../models/categoria.interface";
import { CartService } from "../../services/cart.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-productos",
  imports: [CommonModule],
  templateUrl: "./productos.component.html",
  styleUrl: "./productos.component.css",
})
export class ProductosComponent implements OnInit {
  private productoServicio = inject(ProductoService);
  private cartService = inject(CartService);
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  cargando: boolean = true;
  error: string | null = null;
  cantidadCarrito: number = 0;

  categoriaSeleccionada: number | "all" = "all";
  //De ser necesario implementar reactividad con Observables, BehaviorSubject y bla bla bla

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
    this.actualizarCantidad();
  }

  constructor(private router: Router) {}

  /*
  Para una consulta mas completa tener en cuenta lo siguiente.
  Ya que esto viene de la interfaz Observer de RxJS(Padre de Angular)
  next(response) --> cuando llega el JSON
  error(err)     --> si el backend falla
  complete()     --> cuando todo termino
  */

  //listar filtro categoria

  cargarCategorias() {
    this.productoServicio.obtenerCategorias().subscribe({
      next: (response) => {
        if (response.cod === 200) {
          this.categorias = response.datos;
        }
      },
      error: (err) => {
        console.error("error cargando categorias", err);
      },
    });
  }
  //listar productos
  cargarProductos(ctId: number | "all" = "all") {
    this.cargando = true;
    this.error = null;
    let producto$: any;

    if (ctId === "all") {
      producto$ = this.productoServicio.obtenerTodosProductos();
    } else {
      producto$ = this.productoServicio.obtenerPorCategoria(ctId);
    }

    producto$.subscribe({
      next: (response: any) => {
        if (response.cod === 200) {
          this.productos = response.datos;
          console.log("productos: ", this.productos);
        } else {
          this.error = response.msj;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error("Error de filtrado:", err);
        this.error = "Error de comunicación con el servicio de productos.";
        this.cargando = false;
      },
    });
  }

  onCategoriaChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    // Convertir a número o mantener 'all'
    const ctId = value === "all" ? "all" : parseInt(value, 10);

    this.categoriaSeleccionada = ctId;
    this.cargarProductos(ctId); // Llama al método de filtrado/carga
    console.log(`${ctId}`);
  }

  agregarAlCarrito(producto: any) {
    this.cartService.agregarProducto(producto);
    this.cantidadCarrito = this.cartService.obtenerCarrito().length;
  }

  actualizarCantidad() {
    this.cantidadCarrito = this.cartService.obtenerCarrito().length;
  }

  irAlCarrito() {
    this.router.navigate(["/carrito"]);
  }
}
