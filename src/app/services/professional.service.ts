import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface Professional {
  id: string;
  _id?: string;
  name: string;
  role: string;
  rating: number;
  location?: { lat: number; lng: number } | null;
  services?: string[];
  description?: string;
  phone?: string;
  email?: string;

  // campos opcionales usados en templates
  displayName?: string;
  displayRole?: string;
}

export interface Rating {
  id: string;
  professionalId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

@Injectable({
  providedIn: "root",
})
export class ProfessionalService {
  private professionalsSubject = new BehaviorSubject<Professional[]>([]);
  public professionals = this.professionalsSubject.asObservable();
  private ratingsSubject = new BehaviorSubject<Rating[]>([]);
  public ratings = this.ratingsSubject.asObservable();
  private isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  constructor() {
    this.loadProfessionals();
    this.loadRatings();
  }

  loadProfessionals(): void {
    try {
      if (!this.isBrowser) { this.professionalsSubject.next([]); return; }
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const allowed = ["gomero","chapero","mecanico","electricista"];
      const professionals = users
        .filter((u:any) => allowed.includes(String(u.role ?? "").toLowerCase()))
        .map((prof:any) => {
          const roleNormalized = String(prof.role ?? "").toLowerCase();
          let loc = null;
          if (prof.location) {
            const lat = prof.location.lat ?? prof.location.latitude ?? prof.location.coord?.lat ?? null;
            const lng = prof.location.lng ?? prof.location.lon ?? prof.location.longitude ?? prof.location.coord?.lng ?? null;
            if (lat != null && lng != null) loc = { lat: Number(lat), lng: Number(lng) };
          }
          const p: Professional = {
            id: String(prof.id ?? prof._id ?? ""),
            _id: prof._id ?? undefined,
            name: prof.name ?? prof.fullName ?? prof.nombre ?? "",
            role: roleNormalized,
            rating: prof.rating ?? 0,
            location: loc,
            services: prof.services || [],
            description: prof.description || "",
            phone: prof.phone ?? prof.telefono ?? "",
            email: prof.email ?? "",
            displayName: prof.displayName ?? prof.name ?? prof.nombre ?? "",
            displayRole: prof.displayRole ?? roleNormalized,
          };
          return p;
        });

      if (professionals.length === 0) this.loadDefaultProfessionals();
      else this.professionalsSubject.next(professionals);
    } catch (e) {
      console.error("[ProfessionalService] load error", e);
      this.loadDefaultProfessionals();
    }
  }

  private loadDefaultProfessionals(): void {
    const defaultProfessionals: Professional[] = [
      { id: "prof1", name: "Juan Pérez", role: "gomero", rating: 4.5, location: { lat: -34.6037, lng: -58.3816 }, services: ["Reparación de llantas"], displayName: "Juan Pérez", displayRole: "gomero" },
      { id: "prof2", name: "Carlos Rodríguez", role: "mecanico", rating: 4.2, location: { lat: -34.609, lng: -58.3925 }, services: ["Diagnóstico motor"], displayName: "Carlos Rodríguez", displayRole: "mecanico" },
      { id: "prof3", name: "Ana Martínez", role: "chapero", rating: 4.8, location: { lat: -34.6105, lng: -58.3798 }, services: ["Chapear y pintar"], displayName: "Ana Martínez", displayRole: "chapero" },
      { id: "prof4", name: "Luis Gómez", role: "electricista", rating: 4.6, location: { lat: -34.605, lng: -58.385 }, services: ["Instalaciones eléctricas"], displayName: "Luis Gómez", displayRole: "electricista" }
    ];
    this.professionalsSubject.next(defaultProfessionals);
  }

  loadRatings(): void {
    try {
      if (!this.isBrowser) { this.ratingsSubject.next([]); return; }
      const ratings = JSON.parse(localStorage.getItem("ratings") || "[]");
      this.ratingsSubject.next(ratings);
    } catch (e) {
      console.error("[ProfessionalService] loadRatings error", e);
      this.ratingsSubject.next([]);
    }
  }

  getProfessionals(): Professional[] { return this.professionalsSubject.value; }

  getProfessionalById(id: string): Professional | undefined {
    return this.professionalsSubject.value.find((p) => String(p.id) === String(id) || String(p._id ?? "") === String(id));
  }

  getRatingsByProfessionalId(professionalId: string): Rating[] {
    return this.ratingsSubject.value.filter((r) => r.professionalId === professionalId);
  }

  addRating(rating: Omit<Rating, "id" | "date">): void {
    const newRating: Rating = { ...rating, id: this.generateId(), date: new Date().toISOString() };
    const currentRatings = this.ratingsSubject.value;
    const updated = [...currentRatings, newRating];
    if (this.isBrowser) localStorage.setItem("ratings", JSON.stringify(updated));
    this.ratingsSubject.next(updated);
    this.updateProfessionalRating(rating.professionalId);
  }

  private updateProfessionalRating(professionalId: string) {
    const vals = this.getRatingsByProfessionalId(professionalId);
    if (!vals.length) return;
    const sum = vals.reduce((a,b)=>a+b.rating,0);
    const avg = sum/vals.length;
    const pros = this.professionalsSubject.value.map(p => p.id === professionalId ? { ...p, rating: Number(avg.toFixed(1)) } : p);
    this.professionalsSubject.next(pros);
    if (this.isBrowser) {
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const updatedUsers = users.map((u:any) => u.id === professionalId ? { ...u, rating: Number(avg.toFixed(1)) } : u);
        localStorage.setItem("users", JSON.stringify(updatedUsers));
      } catch {}
    }
  }

  async refreshProfessionals(): Promise<void> { this.loadProfessionals(); }

  private generateId(): string { return Math.random().toString(36).substring(2,12); }
}
