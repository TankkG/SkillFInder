import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./register.component.html"
})
export class RegisterComponent {
  name = "";
  email = "";
  password = "";
  role = "cliente";
  error = "";
  isSubmitting = false;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = "";
    this.isSubmitting = true;
    try {
      const payload = {
        id: undefined,
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
        role: (this.role || "cliente").toString().toLowerCase()
      };
      await this.auth.register(payload);
      // redirect done by authService
    } catch (e:any) {
      this.error = e?.message || "Error al registrar";
    } finally {
      this.isSubmitting = false;
    }
  }
}
