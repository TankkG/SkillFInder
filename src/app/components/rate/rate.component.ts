import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import  { Router } from "@angular/router"
import  { Location } from "@angular/common"
import  { AuthService } from "../../services/auth.service"
import  { ProfessionalService } from "../../services/professional.service"
import { StarRatingComponent } from "../shared/star-rating/star-rating.component"

@Component({
  selector: "app-rate",
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  templateUrl: "./rate.component.html",
  styleUrls: ["./rate.component.css"],
})
export class RateComponent implements OnInit {
  rating = 0
  comment = ""
  user: any
  professionalId = ""
  professional: any

  constructor(
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private professionalService: ProfessionalService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser()
    if (!this.user) {
      this.router.navigate(["/login"])
      return
    }

    this.professionalId = localStorage.getItem("currentProfessionalId") || ""
    if (this.professionalId) {
      this.professional = this.professionalService.getProfessionalById(this.professionalId)
    } else {
      this.router.navigate(["/client-dashboard"])
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

    this.professionalService.addRating({
      professionalId: this.professionalId,
      clientId: this.user.id,
      clientName: this.user.name,
      rating: this.rating,
      comment: this.comment,
    })

    this.router.navigate(["/professional-profile", this.professionalId])
  }

  goBack(): void {
    this.location.back()
  }

  logout(): void {
    this.authService.logout()
  }
}
