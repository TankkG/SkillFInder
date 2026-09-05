import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"

export interface Location {
  lat: number
  lng: number
  address?: string
}

@Injectable({
  providedIn: "root",
})
export class LocationService {
  private currentLocationSubject = new BehaviorSubject<Location | null>(null)
  public currentLocation$ = this.currentLocationSubject.asObservable()
  private isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined"

  constructor() {
    this.getCurrentPosition()
  }

  getCurrentPosition(): void {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          this.currentLocationSubject.next(location)
          if (this.isBrowser) localStorage.setItem("lastLocation", JSON.stringify(location))
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          if (this.isBrowser) {
            const lastLocation = localStorage.getItem("lastLocation")
            if (lastLocation) {
              this.currentLocationSubject.next(JSON.parse(lastLocation))
              return
            }
          }
          // fallback
          this.currentLocationSubject.next({ lat: 19.4326, lng: -99.1332 })
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      // no navegador o geolocation no disponible
      if (this.isBrowser) {
        try {
          const lastLocation = localStorage.getItem("lastLocation")
          if (lastLocation) {
            this.currentLocationSubject.next(JSON.parse(lastLocation))
            return
          }
        } catch {}
      }
      this.currentLocationSubject.next({ lat: 19.4326, lng: -99.1332 })
    }
  }

  getCurrentLocation(): Observable<Location | null> {
    return this.currentLocation$
  }

  getCurrentLocationSync(): Location | null {
    return this.currentLocationSubject.value
  }

  setCurrentLocation(location: Location): void {
    this.currentLocationSubject.next(location)
    if (this.isBrowser) localStorage.setItem("lastLocation", JSON.stringify(location))
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = this.deg2rad(lat2 - lat1)
    const dLng = this.deg2rad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}
