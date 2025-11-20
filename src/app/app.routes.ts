import { Routes } from '@angular/router';
import { ProductosComponent } from './components/productos/productos.component';
import { AuthComponent } from './components/auth/auth.component';

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
];
