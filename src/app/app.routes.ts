import { Routes } from "@angular/router";
import { ProductosComponent } from "./components/productos/productos.component";
import { AuthComponent } from "./components/auth/auth.component";
import { RegisterComponent } from "./components/register/register.component";
import { LoginComponent } from "./components/login/login.component";
import { adminGuard, authGuard } from "./guards/auth.guard";
import { CarritoComponent } from "./components/carrito/carrito.component";

export const routes: Routes = [
  {
    path: "catalogo",
    component: ProductosComponent,
  },

  {
    path: "carrito",
    component: CarritoComponent,
  },

  {
    path: "auth",
    component: AuthComponent,
  },
  {
    path: "", //Ruta por defecto
    redirectTo: "/auth",
    pathMatch: "full",
  },

  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },

  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./components/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent
      ),
  },
  { path: "**", redirectTo: "/login" },

  // Rutas protegidas para administradores
  /*
  { 
    path: 'admin', 
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      }
    ]
  },
  */
];
