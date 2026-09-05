import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessionalService, Professional } from '../../services/professional.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css'],
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private userMarker: any;
  private professionalsLayer: any;
  professionals: Professional[] = [];

  // controles
  selectedRoleFilter = 'all';
  radiusKm: number | null = 5;

  // icons map (nombre de archivo en /assets/icons/<role>.png)
  private icons: Record<string, any> = {};

  constructor(
    private router: Router,
    private professionalService: ProfessionalService,
    private locationService: LocationService,
  ) {}

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.initMap();
    }

    // subscribir profesionales
    this.professionalService.professionals.subscribe((list: Professional[]) => {
      this.professionals = list || [];
      if (this.map) this.applyFiltersAndRender();
    });

    // subscribir ubicación actual para mostrar marcador del usuario
    this.locationService.currentLocation$.subscribe((loc) => {
      if (!loc || !this.map) return;
      this.setOrUpdateUserMarker(loc.lat, loc.lng);
      // re-aplicar filtros (porque el filtro por radio depende de la ubicación actual)
      this.applyFiltersAndRender();
    });
  }

  async initMap(): Promise<void> {
    try {
      const Lmod = await import('leaflet');
      const L = (Lmod as any).default ?? Lmod;

      const fallback: [number, number] = [-17.393, -66.157];

      this.map = L.map('map', {
        center: fallback,
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      this.professionalsLayer = L.layerGroup().addTo(this.map);

      // preparar iconos (simple: assets/icons/<role>.png)
      this.initIcons(L);

      // mostrar ubicación si disponible (LocationService actualizará via suscripción)
      // intentar geolocalizar por si LocationService no lo hizo aún
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            this.locationService.setCurrentLocation({ lat, lng });
            try { this.map.setView([lat, lng], 14); } catch {}
          },
          (err) => {
            console.warn('Geolocation no disponible o permiso denegado:', err);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }

      // finalmente dibujar marcadores si ya hay profesionales
      this.applyFiltersAndRender();
    } catch (e) {
      console.error('Error inicializando Leaflet (dinámico):', e);
    }
  }

  private initIcons(L: any) {
    const base = 'assets/icons/';
    const roles = ['gomero', 'chapero', 'mecanico', 'electricista', 'plomero', 'carpintero'];
    roles.forEach((r) => {
      this.icons[r] = L.icon({
        iconUrl: `${base}${r}.png`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });
    });
    // marcador usuario
    this.icons['user'] = L.icon({
      iconUrl: `${base}client.png`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  }

  private async setOrUpdateUserMarker(lat: number, lng: number) {
    if (!this.map) return;
    try {
      const Lmod = await import('leaflet');
      const L = (Lmod as any).default ?? Lmod;

      if (this.userMarker) {
        this.userMarker.setLatLng([lat, lng]);
      } else {
        const icon = this.icons['user'] ?? undefined;
        this.userMarker = (icon) ? L.marker([lat, lng], { icon }) : L.marker([lat, lng]);
        this.userMarker.addTo(this.map).bindPopup('Tu ubicación').openPopup();
      }
    } catch (err) {
      console.warn('No se pudo crear user marker (leaflet):', err)
    }
  }

  // Aplica filtros y redibuja los marcadores
  applyFiltersAndRender() {
    // obtener profesionales filtrados por rol y/o por radio
    const all = this.professionals || [];
    let filtered = all;

    if (this.selectedRoleFilter && this.selectedRoleFilter !== 'all') {
      filtered = filtered.filter((p) => (p.role || '').toLowerCase() === this.selectedRoleFilter.toLowerCase());
    }

    // si se pide filtro por radio, usar LocationService current location (sync)
    if (this.radiusKm && this.radiusKm > 0) {
      const current = this.locationService.getCurrentLocationSync();
      if (current && current.lat != null && current.lng != null) {
        filtered = filtered.filter((p) => {
          if (!p.location || p.location.lat == null || p.location.lng == null) return false;
          const d = this.locationService.calculateDistance(current.lat, current.lng, p.location.lat, p.location.lng);
          return d <= (this.radiusKm ?? 0);
        });
      }
    }

    this.renderProfessionalsOnMap(filtered);
  }

  private renderProfessionalsOnMap(list: Professional[]) {
    if (!this.map || !this.professionalsLayer) return;

    // limpiar capa
    try {
      this.professionalsLayer.clearLayers();
    } catch {}

    // obtener L dinámicamente
    import('leaflet')
      .then((Lmod) => {
        const L = (Lmod as any).default ?? Lmod;

        list.forEach((p) => {
          try {
            if (!p || !p.location) return;
            const lat = p.location.lat;
            const lng = p.location.lng;
            if (lat == null || lng == null) return;

            const roleKey = (p.role || '').toLowerCase();
            const icon = this.icons[roleKey] ?? null;

            let marker;
            if (icon) {
              marker = L.marker([lat, lng], { icon });
            } else {
              // fallback: círculo con color según rol
              const colorMap: Record<string,string> = {
                gomero: 'red',
                chapero: 'orange',
                mecanico: 'blue',
                electricista: 'green',
                plomero: 'brown',
                carpintero: 'purple',
                default: 'gray'
              };
              const color = colorMap[roleKey] ?? colorMap['default'];
              marker = L.circleMarker([lat, lng], {
                radius: 8,
                fillColor: color,
                color: '#222',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.9
              });
            }

            const popup = `<div style="min-width:170px">
              <strong>${p.name}</strong><br/>
              <small>${p.role}</small><br/>
              Calificación: ${p.rating ?? 0} ⭐<br/>
              ${p.services ? (Array.isArray(p.services) ? p.services.join(', ') : p.services) : ''}<br/>
              ${p.phone ? `<div>Tel: ${p.phone}</div>` : ''}
              </div>`;

            marker.bindPopup(popup);
            marker.addTo(this.professionalsLayer);
          } catch (err) {
            console.warn('Error creando marcador profesional', err, p);
          }
        });
      })
      .catch((e) => {
        console.error('No se pudo importar leaflet al dibujar marcadores:', e);
      });
  }

  // Control UI
  onFilterChange() {
    this.applyFiltersAndRender();
  }

  onRadiusChange() {
    this.applyFiltersAndRender();
  }

  goBack(): void {
    this.router.navigate(['/client-dashboard']);
  }

  ngOnDestroy(): void {
    try {
      if (this.map) this.map.remove();
    } catch (e) {}
  }
}
