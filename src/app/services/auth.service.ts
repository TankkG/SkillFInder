import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { ProfessionalService } from "./professional.service";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  location?: any;
  rating?: number;
  phone?: string;
  description?: string;
  services?: string[];
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private isBrowser: boolean = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  constructor(private router: Router, private professionalService: ProfessionalService) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      if (!this.isBrowser) return;
      const storedUser = localStorage.getItem("loggedInUser");
      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      if (this.isBrowser) localStorage.removeItem("loggedInUser");
    }
  }

  private saveUserToStorage(user: User | null) {
    if (!this.isBrowser) return;
    if (user) localStorage.setItem("loggedInUser", JSON.stringify(user));
    else localStorage.removeItem("loggedInUser");
  }

  private generateId(): string {
    return "u_" + Math.random().toString(36).substring(2, 10);
  }

  // LOGIN: no crear demo; debe existir el usuario en localStorage 'users'
  async login(email: string, password: string): Promise<boolean> {
    try {
      if (!this.isBrowser) return false;
      email = (email || "").toString().trim();
      if (!email || !password) return false;

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) {
        // No crear demo: login falla
        return false;
      }

      const userSession: User = {
        id: user.id ?? this.generateId(),
        name: user.name,
        email: user.email,
        role: (user.role ?? "cliente").toString().toLowerCase(),
        location: user.location,
        phone: user.phone,
        description: user.description,
        services: user.services,
        rating: user.rating ?? 0,
      };

      this.saveUserToStorage(userSession);
      this.currentUserSubject.next(userSession);
      this.redirectUserByRole(userSession.role);
      return true;
    } catch (error) {
      console.error("[AuthService] login error", error);
      return false;
    }
  }

  // REGISTER: añade servicios por rol, normaliza roles, crea id y guarda en users
  async register(userData: any): Promise<void> {
    try {
      if (!this.isBrowser) throw new Error("Registro solo disponible en navegador");
      const roleNormalized = String(userData.role ?? "cliente").toLowerCase();
      const userId = userData.id ?? this.generateId();
      const enhanced = this.addDefaultServices({ ...userData, id: userId, role: roleNormalized });
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const exists = users.find((u: any) => u.email === enhanced.email);
      if (exists) throw new Error("El email ya está registrado");
      users.push(enhanced);
      localStorage.setItem("users", JSON.stringify(users));

      const sessionUser: User = {
        id: enhanced.id,
        name: enhanced.name,
        email: enhanced.email,
        role: enhanced.role,
        location: enhanced.location,
        phone: enhanced.phone,
        description: enhanced.description,
        services: enhanced.services,
        rating: enhanced.rating ?? 0,
      };

      this.saveUserToStorage(sessionUser);
      this.currentUserSubject.next(sessionUser);

      // refrescar profesionales para que aparezca inmediatamente si es profesional
      try { await this.professionalService.refreshProfessionals(); } catch (e) {}
      this.redirectUserByRole(sessionUser.role);
    } catch (error) {
      console.error("[AuthService] register error", error);
      throw error;
    }
  }

  private addDefaultServices(userData: any): any {
    const servicesByRole: Record<string, string[]> = {
      gomero: ["Reparación de llantas","Cambio de neumáticos","Balanceo","Alineación"],
      chapero: ["Chapear y pintar","Enderezado de carrocería"],
      mecanico: ["Diagnóstico y reparación de motor","Frenos","Suspensión"],
      electricista: ["Electricista de autos: sistemas eléctricos","Diagnóstico de baterías","Iluminación"],
      cliente: []
    };
    const role = String(userData.role ?? "cliente").toLowerCase();
    return {
      ...userData,
      id: userData.id ?? this.generateId(),
      role,
      services: servicesByRole[role] ?? [],
      rating: 0,
      description: userData.description ?? this.getDefaultDescription(role),
    }
  }

  private getDefaultDescription(role: string): string {
    const map: Record<string,string> = {
      gomero: "Especialista en reparación de neumáticos.",
      chapero: "Chapero: pintura y enderezado.",
      mecanico: "Mecánico automotriz.",
      electricista: "Electricista de autos especializado.",
      cliente: ""
    };
    return map[role] ?? "";
  }

  private redirectUserByRole(role: string): void {
    const proRoles = ["gomero","chapero","mecanico","electricista"];
    if (proRoles.includes(role)) this.router.navigate(["/professional-dashboard"]);
    else this.router.navigate(["/client-dashboard"]);
  }

  logout(): void {
    try { this.saveUserToStorage(null); this.currentUserSubject.next(null); this.router.navigate(["/login"]); } catch {}
  }

  getCurrentUser(): User | null { return this.currentUserSubject.value }
  isLoggedIn(): boolean { return !!this.currentUserSubject.value }

  getAllUsers(): any[] {
    if (!this.isBrowser) return [];
    try { return JSON.parse(localStorage.getItem("users") || "[]"); } catch { return []; }
  }
}
