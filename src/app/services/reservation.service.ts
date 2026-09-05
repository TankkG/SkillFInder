import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface Reservation {
  id: string;
  professionalId: string;
  professionalName: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

@Injectable({
  providedIn: "root",
})
export class ReservationService {
  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  public reservations = this.reservationsSubject.asObservable();
  private isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  constructor() {
    try {
      if (!this.isBrowser) { this.reservationsSubject.next([]); return; }
      const stored = localStorage.getItem("reservations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) this.reservationsSubject.next(parsed);
        else { localStorage.removeItem("reservations"); this.reservationsSubject.next([]); }
      } else this.reservationsSubject.next([]);
    } catch (e) {
      console.error("[ReservationService] init error", e);
      if (this.isBrowser) localStorage.removeItem("reservations");
      this.reservationsSubject.next([]);
    }
  }

  private persist(list: Reservation[]) {
    try { if (this.isBrowser) localStorage.setItem("reservations", JSON.stringify(list)); } catch(e){ console.error(e); }
  }

  getReservations(): Reservation[] { return this.reservationsSubject.value; }

  getReservationsByProfessionalId(professionalId: string): Reservation[] {
    return this.reservationsSubject.value.filter(r => String(r.professionalId) === String(professionalId));
  }

  getReservationsByClientId(clientId: string): Reservation[] {
    return this.reservationsSubject.value.filter(r => String(r.clientId) === String(clientId));
  }

  addReservation(reservation: Omit<Reservation,"id">): { ok: boolean; reason?: string; reservation?: Reservation } {
    try {
      const profId = String(reservation.professionalId);
      if (!profId || !reservation.date || !reservation.time || !reservation.clientId) return { ok:false, reason: "Datos incompletos" };

      if (!this.isTimeSlotAvailable(profId, reservation.date, reservation.time)) {
        return { ok:false, reason: "Horario no disponible" };
      }

      const newRes: Reservation = { ...reservation, id: this.generateId() };
      const cur = this.reservationsSubject.value;
      const updated = [...cur, newRes];
      this.persist(updated);
      this.reservationsSubject.next(updated);
      return { ok:true, reservation: newRes };
    } catch (e) {
      console.error("[ReservationService] add error", e);
      return { ok:false, reason: "Error creando reserva" };
    }
  }

  updateReservationStatus(reservationId: string, status: Reservation["status"]) {
    const cur = this.reservationsSubject.value;
    const updated = cur.map(r => r.id === reservationId ? { ...r, status } : r);
    this.persist(updated);
    this.reservationsSubject.next(updated);
  }

  isTimeSlotAvailable(professionalId: string, date: string, time: string): boolean {
    const reservations = this.getReservationsByProfessionalId(professionalId);
    const exist = reservations.find(r => r.date === date && r.time === time && r.status !== "cancelled");
    return !exist;
  }

  getAvailableTimeSlots(professionalId: string, date: string): string[] {
    const all = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];
    return all.filter(t => this.isTimeSlotAvailable(String(professionalId), date, t));
  }

  private generateId(): string { return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15); }
}
