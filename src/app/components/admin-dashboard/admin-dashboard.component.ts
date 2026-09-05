import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService, User } from "../../services/auth.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  editUserId: string | null = null;
  newUser: Partial<User> = { name: "", email: "", role: "client", password: "" };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = this.authService.getAllUsers() || [];
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  createUser(): void {
    const payload: User = {
      id: this.generateId(),
      name: this.newUser.name || "Sin nombre",
      email: this.newUser.email || "",
      role: this.newUser.role || "client",
      password: this.newUser.password || "",
      location: this.newUser.location,
      phone: this.newUser.phone,
      description: this.newUser.description
    };
    // Save to localStorage
    const users = this.authService.getAllUsers();
    users.push(payload);
    localStorage.setItem("users", JSON.stringify(users));
    this.newUser = { name: "", email: "", role: "client", password: "" };
    this.loadUsers();
  }

  startEdit(user: User): void {
    this.editUserId = user.id;
  }

  saveEdit(user: User): void {
    const users = this.authService.getAllUsers();
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem("users", JSON.stringify(users));
      this.editUserId = null;
      this.loadUsers();
    }
  }

  cancelEdit(): void {
    this.editUserId = null;
    this.loadUsers();
  }

  deleteUser(userId: string): void {
    if (!confirm("¿Eliminar usuario? Esta acción no se puede deshacer.")) return;
    const users = this.authService.getAllUsers().filter(u => u.id !== userId);
    localStorage.setItem("users", JSON.stringify(users));
    // If deleted currently logged in user, log out
    const current = this.authService.getCurrentUser();
    if (current && current.id === userId) {
      this.authService.logout();
    }
    this.loadUsers();
  }

  goBack(): void {
    this.router.navigate(["/"]);
  }
}