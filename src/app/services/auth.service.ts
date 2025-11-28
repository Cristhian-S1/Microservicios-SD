import { Injectable } from "@angular/core";
import {
  LoginRequest,
  RegisterRequest,
  Usuario,
} from "../models/usuario.interface";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
import { Respuesta } from "../models/respuesta.interface";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:3000/api/auth";
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser$: Observable<Usuario | null>;

  constructor(private http: HttpClient) {
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Obtener el usuario actual
   */
  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<Respuesta<Usuario>> {
    return this.http
      .post<Respuesta<Usuario>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.cod === 200 && response.datos) {
            this.saveUserToStorage(response.datos);
            this.currentUserSubject.next(response.datos);
          }
        }),
        catchError((error) => {
          console.error("Error en login:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Registro de nuevo usuario
   */
  register(userData: RegisterRequest): Observable<Respuesta<Usuario>> {
    return this.http
      .post<Respuesta<Usuario>>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response) => {
          if (response.cod === 200 && response.datos) {
            // Opcionalmente auto-login después del registro
            this.saveUserToStorage(response.datos);
            this.currentUserSubject.next(response.datos);
          }
        }),
        catchError((error) => {
          console.error("Error en registro:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
    this.currentUserSubject.next(null);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    return this.currentUserValue?.es_admin === true;
  }

  /**
   * Obtener el ID del usuario actual
   */
  getUserId(): number | null {
    return this.currentUserValue?.us_id || null;
  }

  /**
   * Guardar usuario en localStorage
   */
  private saveUserToStorage(user: Usuario): void {
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("userId", user.us_id.toString());
  }

  /**
   * Recuperar usuario de localStorage
   */
  private getUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user from storage:", e);
        return null;
      }
    }
    return null;
  }

  /**
   * Actualizar datos del usuario en storage
   */
  updateUserData(user: Usuario): void {
    this.saveUserToStorage(user);
    this.currentUserSubject.next(user);
  }
}
