import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent {
  email = "";
  password = "";
  isLoggingIn = false;
  errorMessage = "";

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    this.errorMessage = "";
    if (!this.email || !this.password) {
      this.errorMessage = "Completa email y contraseña";
      return;
    }
    this.isLoggingIn = true;
    try {
      const ok = await this.auth.login(this.email.trim(), this.password);
      if (!ok) {
        this.errorMessage = "Credenciales incorrectas.";
      } else {
        // AuthService ya redirige por rol
      }
    } catch (e: any) {
      this.errorMessage = e?.message || "Error al iniciar sesión";
    } finally {
      this.isLoggingIn = false;
    }
  }

  // --- BOTONES DE "DEMO" DESHABILITADOS (no crean usuarios demo) ---
  loginDemo() {
    // Quitamos funcionalidad demo: mostramos mensaje claro
    this.errorMessage = "Funcionalidad demo deshabilitada. Usa un usuario registrado.";
  }

  loginProfDemo() {
    this.errorMessage = "Funcionalidad demo (profesional) deshabilitada. Usa un profesional registrado.";
  }

  // Mostrar usuarios registrados en consola (útil para debug)
  showRegisteredUsers() {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      console.log("Usuarios registrados:", users);
      alert("Ver consola del navegador (DevTools) para ver la lista de usuarios registrados.");
    } catch (e) {
      console.warn("No hay usuarios o error leyendo users");
      alert("No hay usuarios registrados.");
    }
  }
}
