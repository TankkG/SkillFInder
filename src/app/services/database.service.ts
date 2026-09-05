import { Injectable } from "@angular/core"

// Simulación de conexión a MySQL
// En producción, esto se conectaría a tu API backend que maneja MySQL
@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private apiUrl = "http://localhost:3000/api" // URL de tu API backend
  private isBackendAvailable = false

  constructor() {
    this.checkBackendConnection()
  }

  // Mejorar el método checkBackendConnection para ser más robusto
  private async checkBackendConnection(): Promise<void> {
    try {
      console.log("Verificando conexión con el backend...")
      const response = await fetch(`${this.apiUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        this.isBackendAvailable = true
        console.log("Estado del backend:", data)
        console.log(`Backend conectado: ${data.status === "OK" ? "✅" : "❌"}`)
        console.log(`Base de datos: ${data.database === "connected" ? "✅ Conectada" : "❌ Desconectada"}`)
        console.log(`Modo: ${data.mode}`)
      } else {
        this.isBackendAvailable = false
        console.warn("Backend no disponible, usando localStorage como fallback")
      }
    } catch (error) {
      this.isBackendAvailable = false
      console.warn("Error al conectar con el backend:", error)
      console.warn("Usando localStorage como fallback")
    }
  }

  // Método público para verificar la conexión
  public async verifyConnection(): Promise<{ backend: boolean; database?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        this.isBackendAvailable = true
        return {
          backend: true,
          database: data.database,
        }
      } else {
        this.isBackendAvailable = false
        return {
          backend: false,
        }
      }
    } catch (error) {
      this.isBackendAvailable = false
      return {
        backend: false,
      }
    }
  }

  // Simulación de operaciones de base de datos
  // En producción, estas serían llamadas HTTP a tu API

  async createUser(userData: any): Promise<any> {
    console.log("Attempting to create user:", userData)

    try {
      if (!this.isBackendAvailable) {
        throw new Error("Backend not available")
      }

      // Simulación de inserción en tabla users
      const response = await fetch(`${this.apiUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("User created successfully in database:", result)
      return result
    } catch (error) {
      console.error("Error en createUser (using localStorage fallback):", error)
      // Fallback a localStorage para desarrollo
      return this.createUserLocal(userData)
    }
  }

  async getUsers(): Promise<any[]> {
    try {
      if (!this.isBackendAvailable) {
        throw new Error("Backend not available")
      }

      const response = await fetch(`${this.apiUrl}/users`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const users = await response.json()
      console.log("Users loaded from database:", users.length)
      return users
    } catch (error) {
      console.error("Error en getUsers (using localStorage fallback):", error)
      return this.getUsersLocal()
    }
  }

  async getProfessionals(): Promise<any[]> {
    try {
      if (!this.isBackendAvailable) {
        throw new Error("Backend not available")
      }

      const response = await fetch(`${this.apiUrl}/professionals`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const professionals = await response.json()
      console.log("Professionals loaded from database:", professionals.length)
      return professionals
    } catch (error) {
      console.error("Error en getProfessionals (using localStorage fallback):", error)
      return this.getProfessionalsLocal()
    }
  }

  async createReservation(reservationData: any): Promise<any> {
    try {
      if (!this.isBackendAvailable) {
        throw new Error("Backend not available")
      }

      const response = await fetch(`${this.apiUrl}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error en createReservation (using localStorage fallback):", error)
      return this.createReservationLocal(reservationData)
    }
  }

  async getReservations(): Promise<any[]> {
    try {
      if (!this.isBackendAvailable) {
        throw new Error("Backend not available")
      }

      const response = await fetch(`${this.apiUrl}/reservations`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error en getReservations (using localStorage fallback):", error)
      return this.getReservationsLocal()
    }
  }

  async createRating(ratingData: any): Promise<any> {
    try {
      if (!this.isBackendAvailable) {
        throw new Error("Backend not available")
      }

      const response = await fetch(`${this.apiUrl}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error en createRating (using localStorage fallback):", error)
      return this.createRatingLocal(ratingData)
    }
  }

  async getRatings(): Promise<any[]> {
    try {
      if (!this.isBackendAvailable) {
        throw new Error("Backend not available")
      }

      const response = await fetch(`${this.apiUrl}/ratings`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error en getRatings (using localStorage fallback):", error)
      return this.getRatingsLocal()
    }
  }

  // Métodos de fallback usando localStorage (para desarrollo)
  private createUserLocal(userData: any): any {
    console.log("Creating user in localStorage:", userData)
    const users = this.getUsersLocal()
    const newUser = {
      id: this.generateId(),
      ...userData,
      created_at: new Date().toISOString(),
    }
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))
    console.log("User saved to localStorage:", newUser)
    return newUser
  }

  private getUsersLocal(): any[] {
    const users = localStorage.getItem("users")
    const parsedUsers = users ? JSON.parse(users) : []
    console.log("Users from localStorage:", parsedUsers.length)
    return parsedUsers
  }

  private getProfessionalsLocal(): any[] {
    const users = this.getUsersLocal()
    const professionals = users.filter((user) =>
      ["gomero", "plomero", "carpintero", "electricista"].includes(user.role),
    )
    console.log("Professionals from localStorage:", professionals.length)
    return professionals
  }

  private createReservationLocal(reservationData: any): any {
    const reservations = this.getReservationsLocal()
    const newReservation = {
      id: this.generateId(),
      ...reservationData,
      created_at: new Date().toISOString(),
    }
    reservations.push(newReservation)
    localStorage.setItem("reservations", JSON.stringify(reservations))
    return newReservation
  }

  private getReservationsLocal(): any[] {
    const reservations = localStorage.getItem("reservations")
    return reservations ? JSON.parse(reservations) : []
  }

  private createRatingLocal(ratingData: any): any {
    const ratings = this.getRatingsLocal()
    const newRating = {
      id: this.generateId(),
      ...ratingData,
      created_at: new Date().toISOString(),
    }
    ratings.push(newRating)
    localStorage.setItem("ratings", JSON.stringify(ratings))
    return newRating
  }

  private getRatingsLocal(): any[] {
    const ratings = localStorage.getItem("ratings")
    return ratings ? JSON.parse(ratings) : []
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Método para verificar el estado de la conexión
  getConnectionStatus(): boolean {
    return this.isBackendAvailable
  }
}
