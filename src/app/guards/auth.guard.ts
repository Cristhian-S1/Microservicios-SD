import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL intentada para redirigir después del login
  router.navigate(["/login"], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

// Guard para rutas de admin
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  if (authService.isAuthenticated()) {
    // Usuario autenticado pero no es admin
    router.navigate(["/carrito"]);
  } else {
    // Usuario no autenticado
    router.navigate(["/login"]);
  }
  return false;
};
