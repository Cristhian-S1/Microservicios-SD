import { Routes } from '@angular/router';
import { ProductosComponent } from './components/productos/productos.component';
import { AuthComponent } from './components/auth/auth.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  {
    path: 'catalogo',
    component: ProductosComponent,
  },

  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: '', //Ruta por defecto
    redirectTo: '/auth',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
