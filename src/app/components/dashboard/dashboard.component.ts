import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { Usuario } from "../../models/usuario.interface";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="user-info" *ngIf="currentUser">
          <img
            [src]="currentUser.us_icono || 'assets/default-avatar.png'"
            alt="Avatar"
            class="user-avatar"
          />
          <span>{{ currentUser.us_nombre }}</span>
          <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
        </div>
      </header>

      <main class="dashboard-content">
        <div class="welcome-card" *ngIf="currentUser">
          <h2>¡Bienvenido, {{ currentUser.us_nombre }}!</h2>
          <div class="user-details">
            <p><strong>Email:</strong> {{ currentUser.us_email }}</p>
            <p><strong>ID:</strong> {{ currentUser.us_id }}</p>
            <p *ngIf="currentUser.us_fecha_nacimiento">
              <strong>Fecha de nacimiento:</strong>
              {{ currentUser.us_fecha_nacimiento | date : "dd/MM/yyyy" }}
            </p>
            <p *ngIf="currentUser.es_admin">
              <strong>Rol:</strong> <span class="badge">Administrador</span>
            </p>
          </div>
        </div>

        <div class="info-section">
          <h3>Datos almacenados en localStorage:</h3>
          <pre>{{ localStorageData }}</pre>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        background: #f5f5f5;
      }

      .dashboard-header {
        background: white;
        padding: 1rem 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .logout-btn {
        padding: 0.5rem 1rem;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .logout-btn:hover {
        background: #c82333;
      }

      .dashboard-content {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .welcome-card,
      .info-section {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      }

      .user-details {
        margin-top: 1rem;
      }

      .user-details p {
        margin: 0.5rem 0;
      }

      .badge {
        background: #007bff;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
      }

      pre {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: Usuario | null = null;
  localStorageData: string = "";

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Obtener el usuario actual del servicio
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Mostrar datos de localStorage
    this.localStorageData = JSON.stringify(
      {
        currentUser: localStorage.getItem("currentUser"),
        userId: localStorage.getItem("userId"),
      },
      null,
      2
    );

    console.log("Usuario actual:", this.currentUser);
    console.log("ID del usuario:", this.authService.getUserId());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
