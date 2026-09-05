import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Sólo ejecutar las configuraciones de Leaflet en navegador
if (typeof window !== 'undefined') {
  // carga dinámica para evitar errores en SSR
  import('leaflet').then((Lmodule) => {
    const L = (Lmodule as any).default ?? Lmodule;
    try {
      // Solo si existe L.Icon.Default
      if (L && L.Icon && L.Icon.Default) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'assets/leaflet/images/marker-icon-2x.png',
          iconUrl: 'assets/leaflet/images/marker-icon.png',
          shadowUrl: 'assets/leaflet/images/marker-shadow.png',
        });
      }
    } catch (e) {
      console.warn('No se pudo configurar iconos de Leaflet (probablemente en SSR):', e);
    }
  }).catch((e) => {
    console.warn('Error importando leaflet en main.ts:', e);
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
