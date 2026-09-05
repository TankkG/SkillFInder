import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import  { AuthService } from "./auth.service"
import  { ClientRatingService } from "./client-rating.service"
import  { ReservationService } from "./reservation.service"

export interface Client {
  id: string
  name: string
  email: string
  location: string
  rating: number
}

@Injectable({
  providedIn: "root",
})
export class ClientService {
  private clientsSubject = new BehaviorSubject<Client[]>([])
  public clients = this.clientsSubject.asObservable()

  constructor(
    private authService: AuthService,
    private clientRatingService: ClientRatingService,
    private reservationService: ReservationService,
  ) {
    // Inicializar con datos de prueba o cargar del localStorage
    this.loadClients()
  }

  private loadClients(): void {
    // En una aplicación real, esto vendría de una API
    // Por ahora, vamos a extraer los clientes de las reservas
    const reservations = this.reservationService.getReservations()
    const clientsMap = new Map<string, Client>()

    // Extraer clientes únicos de las reservas
    reservations.forEach((reservation) => {
      if (!clientsMap.has(reservation.clientId)) {
        clientsMap.set(reservation.clientId, {
          id: reservation.clientId,
          name: reservation.clientName,
          email: "", // No tenemos esta información en las reservas
          location: "", // No tenemos esta información en las reservas
          rating: 0, // Se actualizará después
        })
      }
    })

    // Convertir el mapa a un array
    const clientsList = Array.from(clientsMap.values())

    // Actualizar las calificaciones
    clientsList.forEach((client) => {
      client.rating = this.clientRatingService.getClientAverageRating(client.id)
    })

    this.clientsSubject.next(clientsList)
  }

  getClients(): Client[] {
    return this.clientsSubject.value
  }

  getClientById(id: string): Client | undefined {
    return this.clientsSubject.value.find((c) => c.id === id)
  }

  getClientsByProfessionalId(professionalId: string): Client[] {
    // Obtener todas las reservas para este profesional
    const reservations = this.reservationService.getReservationsByProfessionalId(professionalId)

    // Extraer IDs de clientes únicos
    const clientIds = [...new Set(reservations.map((r) => r.clientId))]

    // Obtener los clientes correspondientes
    return clientIds.map((id) => {
      const client = this.getClientById(id)
      if (client) {
        // Actualizar la calificación
        return {
          ...client,
          rating: this.clientRatingService.getClientAverageRating(id),
        }
      }

      // Si no encontramos el cliente en nuestra lista, lo creamos a partir de la reserva
      const reservation = reservations.find((r) => r.clientId === id)
      if (reservation) {
        return {
          id: reservation.clientId,
          name: reservation.clientName,
          email: "",
          location: "",
          rating: this.clientRatingService.getClientAverageRating(id),
        }
      }

      // Este caso no debería ocurrir
      return {
        id,
        name: "Cliente desconocido",
        email: "",
        location: "",
        rating: 0,
      }
    })
  }

  updateClientsList(): void {
    this.loadClients()
  }
}
