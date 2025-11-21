import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  regist: boolean = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      setTimeout(() => {
        const { email, password } = this.loginForm.value;
        
        if (email === 'demo@ejemplo.com' && password === 'demo123') {
          this.successMessage = '¡Inicio de sesión exitoso! Redirigiendo...';
          this.isLoading = false;
          
          setTimeout(() => {
            console.log('Redirigiendo al dashboard...');
          }, 1500);
        } else {
          this.errorMessage = 'Credenciales incorrectas. Intenta con demo@ejemplo.com / demo123';
          this.isLoading = false;
        }
      }, 1500);
    }
  }

}
