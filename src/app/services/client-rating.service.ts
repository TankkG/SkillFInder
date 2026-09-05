import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

export interface ClientRating {
  id: string
  clientId: string
  professionalId: string
  professionalName: string
  rating: number
  comment: string
  date: string
}

@Injectable({
  providedIn: "root",
})
export class ClientRatingService {
  private clientRatingsSubject = new BehaviorSubject<ClientRating[]>([])
  public clientRatings = this.clientRatingsSubject.asObservable()

  constructor() {
    // Cargar calificaciones del localStorage
    const storedRatings = localStorage.getItem("clientRatings")
    if (storedRatings) {
      this.clientRatingsSubject.next(JSON.parse(storedRatings))
    }
  }

  getRatingsByClientId(clientId: string): ClientRating[] {
    return this.clientRatingsSubject.value.filter((r) => r.clientId === clientId)
  }

  getRatingsByProfessionalId(professionalId: string): ClientRating[] {
    return this.clientRatingsSubject.value.filter((r) => r.professionalId === professionalId)
  }

  addRating(rating: Omit<ClientRating, "id" | "date">): void {
    const newRating: ClientRating = {
      ...rating,
      id: this.generateId(),
      date: new Date().toISOString(),
    }

    const currentRatings = this.clientRatingsSubject.value
    const updatedRatings = [...currentRatings, newRating]

    // Actualizar en localStorage
    localStorage.setItem("clientRatings", JSON.stringify(updatedRatings))
    this.clientRatingsSubject.next(updatedRatings)
  }

  getClientAverageRating(clientId: string): number {
    const ratings = this.getRatingsByClientId(clientId)
    if (ratings.length === 0) return 0

    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0)
    return Number.parseFloat((sum / ratings.length).toFixed(1))
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}
