import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReservationService, Reservation } from "../../services/reservation.service";
import { AuthService } from "../../services/auth.service";
import { ProfessionalService } from "../../services/professional.service";
import { StarRatingComponent } from "../shared/star-rating/star-rating.component";

@Component({
  selector: "app-professional-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  templateUrl: "./professional-dashboard.component.html",
  styleUrls: ["./professional-dashboard.component.css"]
})
export class ProfessionalDashboardComponent implements OnInit {
  reservations: Reservation[] = [];
  user: any = null;
  pendingReservations: Reservation[] = [];
  completedReservations: Reservation[] = [];
  ratings: any[] = [];
  qrCode: string | null = null;

  constructor(
    private resService: ReservationService,
    private auth: AuthService,
    private profService: ProfessionalService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.loadAll();
    this.resService.reservations.subscribe(()=> this.loadAll());
  }

  loadAll() {
    if (!this.user) { this.reservations = []; this.pendingReservations = []; this.completedReservations = []; return; }
    this.reservations = this.resService.getReservationsByProfessionalId(String(this.user.id));
    this.pendingReservations = this.reservations.filter(r => r.status === "pending" || r.status === "confirmed");
    this.completedReservations = this.reservations.filter(r => r.status === "completed");
    try { this.ratings = this.profService.getRatingsByProfessionalId(String(this.user.id)) || []; } catch { this.ratings = []; }
  }

  get averageRating(): number {
    if (!this.ratings || this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((a:any,b:any)=>a+b.rating,0);
    return Number((sum / this.ratings.length).toFixed(1));
  }
  get totalReservations(): number { return this.reservations.length; }
  get pendingReservationsCount(): number { return this.pendingReservations.length; }
  get completedReservationsCount(): number { return this.completedReservations.length; }

  logout() { this.auth.logout(); }
  viewClients() {}

  getStatusClass(status: string) {
    switch(status) {
      case "pending": return "status-pending";
      case "confirmed": return "status-confirmed";
      case "completed": return "status-completed";
      case "cancelled": return "status-cancelled";
      default: return "";
    }
  }

  getStatusText(status: string) {
    switch(status) {
      case "pending": return "Pendiente";
      case "confirmed": return "Confirmada";
      case "completed": return "Completada";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  }

  formatDate(dateStr: string) {
    try { const d = new Date(dateStr); return d.toLocaleDateString(); } catch { return dateStr; }
  }

  updateReservationStatus(reservationId: string, status: Reservation["status"]) {
    this.resService.updateReservationStatus(reservationId, status);
    this.loadAll();
  }

  generateQRCodeForReservation(res: Reservation) {
    try {
      const data = JSON.stringify({ type: "reservation", id: res.id, professional: res.professionalName, client: res.clientName, date: res.date, time: res.time });
      this.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    } catch (e) { this.qrCode = null; }
  }

  downloadQRCode() {
    if (!this.qrCode) return;
    const a = document.createElement('a');
    a.href = this.qrCode;
    a.download = 'reservation-qr.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
