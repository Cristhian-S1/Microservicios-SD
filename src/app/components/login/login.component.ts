import { Component } from "@angular/core";
import { Validators } from "@angular/forms";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { LoginRequest } from "../../models/usuario.interface";

@Component({
  selector: "app-login",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = "";
  successMessage = "";
  regist: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.successMessage = response.msj || "¡Inicio de sesión exitoso!";
          this.isLoading = false;

          console.log("Usuario logueado:", response.datos);
          console.log(
            "ID guardado en localStorage:",
            localStorage.getItem("userId")
          );

          // Redirigir según el tipo de usuario
          setTimeout(() => {
            if (response.datos.es_admin) {
              this.router.navigate(["/admin/dashboard"]);
            } else {
              this.router.navigate(["/catalogo"]);
            }
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;

          // Manejar diferentes tipos de errores
          if (error.status === 401) {
            this.errorMessage =
              "Credenciales incorrectas. Por favor, verifica tu email y contraseña.";
          } else if (error.status === 400) {
            this.errorMessage = "Email y contraseña son requeridos.";
          } else if (error.status === 0) {
            this.errorMessage =
              "No se pudo conectar con el servidor. Verifica tu conexión.";
          } else {
            this.errorMessage =
              error.error?.msj ||
              "Error al iniciar sesión. Intenta nuevamente.";
          }

          console.error("Error en login:", error);
        },
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // Método auxiliar para acceder fácilmente a los controles del formulario
  get f() {
    return this.loginForm.controls;
  }
}
