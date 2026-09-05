import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"

@Component({
  selector: "app-login-simple",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <h2>Iniciar Sesión (Modo Simplificado)</h2>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" [(ngModel)]="email" name="email" />
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" [(ngModel)]="password" name="password" />
      </div>

      <button (click)="login()" [disabled]="isLoggingIn">
        {{ isLoggingIn ? 'Iniciando sesión...' : 'Ingresar' }}
      </button>
      
      <div class="register-link">
        ¿No tienes cuenta? <a routerLink="/select-role">Regístrate aquí</a>
      </div>

      <div *ngIf="errorMessage" class="error">
        {{ errorMessage }}
      </div>

      <div class="dev-options">
        <h3>Opciones de desarrollo</h3>
        <button (click)="loginAsClient()" class="btn-dev">Entrar como Cliente</button>
        <button (click)="loginAsProfessional()" class="btn-dev">Entrar como Profesional</button>
      </div>
    </div>
  `,
  styles: [
    `
    .login-container {
      max-width: 400px;
      margin: 40px auto;
      padding: 30px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 25px;
      color: #333;
      font-size: 24px;
    }

    .form-group {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
    }

    label {
      font-weight: 600;
      margin-bottom: 8px;
      color: #555;
    }

    input {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    button {
      width: 100%;
      padding: 14px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      margin-top: 10px;
    }

    button:hover {
      background-color: #2980b9;
    }

    button:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }

    .error {
      color: #e74c3c;
      margin-top: 15px;
      text-align: center;
      font-weight: 500;
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
      font-size: 15px;
    }

    .register-link a {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }

    .dev-options {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px dashed #ddd;
    }

    .dev-options h3 {
      font-size: 16px;
      color: #666;
      margin-bottom: 15px;
      text-align: center;
    }

    .btn-dev {
      background-color: #27ae60;
      margin-bottom: 10px;
    }

    .btn-dev:hover {
      background-color: #219955;
    }
  `,
  ],
})
export class LoginSimpleComponent {
  email = ""
  password = ""
  errorMessage = ""
  isLoggingIn = false

  constructor(private router: Router) {}

  login(): void {
    this.isLoggingIn = true
    this.errorMessage = ""

    // Simulación de login
    setTimeout(() => {
      if (this.email && this.password) {
        // Crear usuario de prueba
        const user = {
          id: "user123",
          name: "Usuario Normal",
          email: this.email,
          role: "cliente",
        }

        // Guardar en localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(user))

        // Redireccionar
        this.router.navigate(["/client-dashboard"])
      } else {
        this.errorMessage = "Por favor ingresa email y contraseña"
        this.isLoggingIn = false
      }
    }, 1000)
  }

  loginAsClient(): void {
    const clientUser = {
      id: "client123",
      name: "Cliente Demo",
      email: "cliente@demo.com",
      role: "cliente",
    }

    localStorage.setItem("loggedInUser", JSON.stringify(clientUser))
    this.router.navigate(["/client-dashboard"])
  }

  loginAsProfessional(): void {
    const profUser = {
      id: "prof123",
      name: "Profesional Demo",
      email: "profesional@demo.com",
      role: "plomero",
      services: ["Reparación de cañerías", "Instalación de grifería", "Detección de fugas"],
    }

    localStorage.setItem("loggedInUser", JSON.stringify(profUser))
    this.router.navigate(["/professional-dashboard"])
  }
}
