import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule,  ActivatedRoute,  Router } from "@angular/router"
import  { Location } from "@angular/common"
import  { AuthService } from "../../services/auth.service"
import  { ClientService, Client } from "../../services/client.service"
import  { ClientRatingService, ClientRating } from "../../services/client-rating.service"
import  { ReservationService, Reservation } from "../../services/reservation.service"
import { StarRatingComponent } from "../shared/star-rating/star-rating.component"

@Component({
  selector: "app-client-profile",
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  templateUrl: "./clients-profile.component.html",
  styleUrls: ["./clients-profile.component.css"],
})
export class ClientProfileComponent implements OnInit {
  user: any
  client: Client | undefined
  clientId = ""
  ratings: ClientRating[] = []
  reservations: Reservation[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private clientService: ClientService,
    private clientRatingService: ClientRatingService,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser()
    if (!this.user) {
      this.router.navigate(["/login"])
      return
    }

    // Verificar que el usuario sea un profesional
    if (
      this.user.role !== "plomero" &&
      this.user.role !== "carpintero" &&
      this.user.role !== "gomero" &&
      this.user.role !== "electricista"
    ) {
      this.router.navigate(["/client-dashboard"])
      return
    }

    this.clientId = this.route.snapshot.paramMap.get("id") || ""
    if (this.clientId) {
      this.loadClientData()
    }
  }

  loadClientData(): void {
    // Cargar datos del cliente
    this.client = this.clientService.getClientById(this.clientId)

    // Cargar calificaciones del cliente
    this.ratings = this.clientRatingService.getRatingsByClientId(this.clientId)

    // Cargar reservas del cliente con este profesional
    this.reservations = this.reservationService
      .getReservations()
      .filter((r) => r.clientId === this.clientId && r.professionalId === this.user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  rateClient(): void {
    this.router.navigate(["/rate-client", this.clientId])
  }

  goBack(): void {
    this.location.back()
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "pending":
        return "status-pending"
      case "confirmed":
        return "status-confirmed"
      case "completed":
        return "status-completed"
      case "cancelled":
        return "status-cancelled"
      default:
        return ""
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmada"
      case "completed":
        return "Completada"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }
}
