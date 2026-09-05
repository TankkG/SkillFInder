import { Component, AfterViewInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-location',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-location.component.html',
  styleUrls: ['./register-location.component.css'],
})
export class RegisterLocationComponent implements AfterViewInit, OnDestroy {
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  private map?: any;
  private marker?: any;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.initMap(), 50);
    }
  }

  async initMap(): Promise<void> {
    try {
      const Lmod = await import('leaflet');
      const L = (Lmod as any).default ?? Lmod;

      const fallback: [number, number] = [-17.393, -66.157];
      this.map = L.map('register-location-map', { center: fallback, zoom: 13 });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!this.map) return;
            this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }

      this.map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        this.setMarker(lat, lng);
        this.locationSelected.emit({ lat, lng });
      });
    } catch (e) {
      console.error('Error inicializando mapa de selección de ubicación (dinámico):', e);
    }
  }

  setMarker(lat: number, lng: number) {
    if (!this.map) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      // usar import dinámico para L.marker cuando sea necesario
      (async () => {
        const Lmod = await import('leaflet');
        const L = (Lmod as any).default ?? Lmod;
        this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
        this.marker.on('dragend', (evt: any) => {
          const p = evt.target.getLatLng();
          this.locationSelected.emit({ lat: p.lat, lng: p.lng });
        });
      })();
    }
    this.map.setView([lat, lng], 15);
  }

  ngOnDestroy(): void {
    try {
      this.map?.remove();
    } catch (e) {}
  }
}
