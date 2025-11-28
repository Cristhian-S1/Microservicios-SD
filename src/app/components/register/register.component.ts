import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { RegisterRequest } from "../../models/usuario.interface";

@Component({
  selector: "app-register",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.css",
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = "";
  successMessage = "";
  passwordStrength = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
        birthDate: [""], // Opcional
        icon: [""], // Opcional
      },
      { validators: this.passwordMatchValidator }
    );

    // Observar cambios en la contraseña para calcular su fortaleza
    this.registerForm.get("password")?.valueChanges.subscribe((password) => {
      this.calculatePasswordStrength(password);
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  calculatePasswordStrength(password: string): void {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    this.passwordStrength = Math.min(Math.ceil(strength / 2), 3);
  }

  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 1:
        return "Contraseña débil";
      case 2:
        return "Contraseña moderada";
      case 3:
        return "Contraseña fuerte";
      default:
        return "";
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const formValues = this.registerForm.value;

      const userData: RegisterRequest = {
        us_nombre: formValues.name,
        us_email: formValues.email,
        us_contrasena: formValues.password,
        us_fecha_nacimiento: formValues.birthDate || undefined,
        us_icono: formValues.icon || undefined,
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.successMessage = response.msj || "¡Cuenta creada exitosamente!";
          this.isLoading = false;

          console.log("Registro exitoso:", response.datos);
          console.log("Usuario guardado en localStorage");

          // Redirigir al login después de un breve delay
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;

          // Manejar diferentes tipos de errores
          if (error.status === 409) {
            this.errorMessage =
              "Este correo electrónico ya está registrado. Por favor, usa otro.";
          } else if (error.status === 400) {
            this.errorMessage =
              error.error?.msj ||
              "Por favor, completa todos los campos requeridos.";
          } else if (error.status === 0) {
            this.errorMessage =
              "No se pudo conectar con el servidor. Verifica tu conexión.";
          } else {
            this.errorMessage =
              error.error?.msj ||
              "Error al crear la cuenta. Intenta nuevamente.";
          }

          console.error("Error en registro:", error);
        },
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  // Método auxiliar para acceder fácilmente a los controles del formulario
  get f() {
    return this.registerForm.controls;
  }
}
