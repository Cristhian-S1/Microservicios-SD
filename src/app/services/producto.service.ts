import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Producto } from "../models/producto.interface";
import { Respuesta } from "../models/respuesta.interface";
import { Observable } from "rxjs";
import { Categoria } from "../models/categoria.interface";

@Injectable({
  providedIn: "root",
})
export class ProductoService {
  //Inyectar dependencias sin usar el constructor
  private ruta: string = "http://localhost:3000/api";
  private http = inject(HttpClient);

  //Obtener todos los productos
  obtenerTodosProductos(): Observable<Respuesta<Producto[]>> {
    const rutaEspecifica = `${this.ruta}/productos`;
    return this.http.get<Respuesta<Producto[]>>(rutaEspecifica);
  }

  obtenerCategorias(): Observable<Respuesta<Categoria[]>> {
    const rutaEspecifica = `${this.ruta}/categorias`;
    return this.http.get<Respuesta<Categoria[]>>(rutaEspecifica);
  }
  obtenerPorCategoria(ctId: number): Observable<Respuesta<Producto[]>> {
    const rutaEspecifica = `${this.ruta}/productos/categoria/${ctId}`;
    return this.http.get<Respuesta<Producto[]>>(rutaEspecifica);
  }
}
