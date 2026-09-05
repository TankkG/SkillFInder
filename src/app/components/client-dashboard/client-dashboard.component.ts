import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReservationService, Reservation } from "../../services/reservation.service";
import { AuthService } from "../../services/auth.service";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-client-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./client-dashboard.component.html"
})
export class ClientDashboardComponent implements OnInit {
  reservations: Reservation[] = [];
  user: any = null;

  constructor(private resService: ReservationService, private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.load();
    this.resService.reservations.subscribe(()=> this.load());
  }

  load() {
    if (!this.user) { this.reservations = []; return; }
    this.reservations = this.resService.getReservationsByClientId(String(this.user.id));
  }
}
