import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Location } from "@angular/common";
import { Subject } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { ProfessionalService } from "../../services/professional.service";
import { ReservationService } from "../../services/reservation.service";

@Component({
  selector: "app-reservation",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./reservation.component.html",
  styleUrls: ["./reservation.component.css"],
})
export class ReservationComponent implements OnInit, OnDestroy {
  user: any = null;
  professional: any = null;
  date = "";
  time = "";
  qrCode = "";
  minDate = "";
  reservationSuccess = false;
  availableTimeSlots: string[] = [];
  errorMessage = "";

  allTimeSlots = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService,
    private professionalService: ProfessionalService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) { this.router.navigate(["/login"]); return; }

    this.minDate = new Date().toISOString().split("T")[0];

    const qId = this.route.snapshot.queryParamMap.get("professionalId");
    const routeId = this.route.snapshot.paramMap.get("id");
    const chosenId = qId ?? routeId;

    if (!chosenId) {
      this.errorMessage = "No se especificó el profesional. Abre la reserva desde el perfil/listado del profesional.";
      return;
    }

    const prof = this.professionalService.getProfessionalById?.(chosenId) || (this.professionalService.getProfessionals?.() || []).find((p:any) => String(p.id)===chosenId || String(p._id ?? "")===chosenId || String(p.professionalId ?? "")===chosenId);

    if (!prof) {
      this.errorMessage = "No se encontró el profesional solicitado. Intenta abrir su perfil y pulsa 'Reservar' desde allí.";
      return;
    }

    this.setProfessional(prof);
  }

  private setProfessional(prof:any) {
    if (!prof) { this.professional = null; this.errorMessage = "No se encontró profesional."; return; }
    if (prof.location) {
      const lat = prof.location.lat ?? prof.location.latitude ?? null;
      const lng = prof.location.lng ?? prof.location.longitude ?? prof.location.lon ?? null;
      prof.location = (lat != null && lng != null) ? { lat: Number(lat), lng: Number(lng) } : null;
    }
    this.professional = prof;
    this.errorMessage = "";
    this.updateAvailableTimeSlots();
    try { localStorage.setItem("currentProfessionalId", String(this.professional.id ?? this.professional._id ?? "")); } catch {}
  }

  onDateChange(): void {
    if (this.date && this.professional) { this.updateAvailableTimeSlots(); this.time = ""; this.errorMessage = ""; }
    else this.availableTimeSlots = [];
  }

  updateAvailableTimeSlots(): void {
    if (!this.professional || !this.date) { this.availableTimeSlots = []; return; }
    this.availableTimeSlots = this.reservationService.getAvailableTimeSlots(String(this.professional.id), this.date);
  }

  onSubmit(): void {
    if (!this.date || !this.time) { this.errorMessage = "Selecciona fecha y hora"; return; }
    if (!this.professional) { this.errorMessage = "Profesional no disponible"; return; }
    const profIdStr = String(this.professional.id);
    if (!this.reservationService.isTimeSlotAvailable(profIdStr, this.date, this.time)) { this.errorMessage = "Horario no disponible"; this.updateAvailableTimeSlots(); return; }

    const reservationData = {
      professionalId: profIdStr,
      professionalName: this.professional.name ?? "",
      clientId: String(this.user.id),
      clientName: this.user.name ?? "",
      date: this.date,
      time: this.time,
      status: "pending" as const
    };

    const res = this.reservationService.addReservation(reservationData);
    if (!res.ok) { this.errorMessage = res.reason || "No fue posible crear la reserva"; this.updateAvailableTimeSlots(); return; }

    this.generateQRCode(reservationData);
    this.reservationSuccess = true;
    this.updateAvailableTimeSlots();
  }

  calificacion(): void {
    if (!this.professional) { this.errorMessage = "No hay profesional para calificar."; return; }
    try { const id = this.professional.id ?? (this.professional as any)._id ?? null; if (id) localStorage.setItem("currentProfessionalId", String(id)); } catch {}
    this.router.navigate(["/rate"]);
  }

  generateQRCode(reservationData:any) {
    const qrData = JSON.stringify({ type:"reservation", professional: this.professional?.name, client: this.user?.name, date:this.date, time:this.time });
    this.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  }

  goBack(): void { this.location.back(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
