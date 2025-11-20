import { Component, inject, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productos',
  imports: [CommonModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosComponent implements OnInit {
  private productoServicio = inject(ProductoService);
  productos: Producto[] = [];

  //De ser necesario implementar reactividad con Observables, BehaviorSubject y bla bla bla

  ngOnInit() {
    this.cargarProducto();
  }

  /*
  Para una consulta mas completa tener en cuenta lo siguiente.
  Ya que esto viene de la interfaz Observer de RxJS(Padre de Angular)
  next(response) --> cuando llega el JSON
  error(err)     --> si el backend falla
  complete()     --> cuando todo termino
  */
  cargarProducto() {
    this.productoServicio.obtenerProductos().subscribe({
      next: (response) => {
        if (response.cod === 200) {
          this.productos = response.datos;
          console.log('Productos:', this.productos);
        } else {
          console.warn('Respuesta inesperada:', response);
        }
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      },
    });
  }
}
