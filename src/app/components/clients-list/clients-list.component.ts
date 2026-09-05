import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { Router } from "@angular/router"
import  { AuthService } from "../../services/auth.service"
import  { ClientService, Client } from "../../services/client.service"
import { StarRatingComponent } from "../shared/star-rating/star-rating.component"

@Component({
  selector: "app-clients-list",
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  templateUrl: "./clients-list.component.html",
  styleUrls: ["./clients-list.component.css"],
})
export class ClientsListComponent implements OnInit {
  user: any
  clients: Client[] = []
  filteredClients: Client[] = []
  searchTerm = ""

  constructor(
    private router: Router,
    private authService: AuthService,
    private clientService: ClientService,
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

    // Cargar clientes que han reservado con este profesional
    this.clients = this.clientService.getClientsByProfessionalId(this.user.id)
    this.filteredClients = [...this.clients]
  }

  viewClientProfile(client: Client): void {
    this.router.navigate(["/client-profile", client.id])
  }

  rateClient(client: Client): void {
    this.router.navigate(["/rate-client", client.id])
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value.toLowerCase()
    this.filterClients()
  }

  filterClients(): void {
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients]
      return
    }

    this.filteredClients = this.clients.filter((client) => client.name.toLowerCase().includes(this.searchTerm))
  }

  goBack(): void {
    this.router.navigate(["/professional-dashboard"])
  }

  logout(): void {
    this.authService.logout()
  }
}
