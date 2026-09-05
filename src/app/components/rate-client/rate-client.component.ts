import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import  { ActivatedRoute, Router } from "@angular/router"
import  { Location } from "@angular/common"
import  { AuthService } from "../../services/auth.service"
import  { ClientService } from "../../services/client.service"
import  { ClientRatingService } from "../../services/client-rating.service"
import { StarRatingComponent } from "../shared/star-rating/star-rating.component"

@Component({
  selector: "app-rate-client",
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  templateUrl: "./rate-client.component.html",
  styleUrls: ["./rate-client.component.css"],
})
export class RateClientComponent implements OnInit {
  rating = 0
  comment = ""
  user: any
  clientId = ""
  client: any

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService,
    private clientService: ClientService,
    private clientRatingService: ClientRatingService,
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
      this.client = this.clientService.getClientById(this.clientId)
      if (!this.client) {
        this.router.navigate(["/professional-dashboard"])
      }
    } else {
      this.router.navigate(["/professional-dashboard"])
    }
  }

  onRatingChange(newRating: number): void {
    console.log("Rating changed to:", newRating)
    this.rating = newRating
  }

  onSubmit(): void {
    if (this.rating === 0) {
      alert("Por favor, selecciona una calificación")
      return
    }

    this.clientRatingService.addRating({
      clientId: this.clientId,
      professionalId: this.user.id,
      professionalName: this.user.name,
      rating: this.rating,
      comment: this.comment,
    })

    // Actualizar la lista de clientes para reflejar la nueva calificación
    this.clientService.updateClientsList()

    this.router.navigate(["/client-profile", this.clientId])
  }

  goBack(): void {
    this.location.back()
  }

  logout(): void {
    this.authService.logout()
  }
}
