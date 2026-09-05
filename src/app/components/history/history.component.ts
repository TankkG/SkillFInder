import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent {
  // Datos de ejemplo para el historial
  history = [
    { type: 'Reserva', description: 'Reserva con Profesional 1', date: '2025-04-20' },
    { type: 'Calificación', description: 'Calificaste a Profesional 2 con 4 estrellas', date: '2025-04-15' },
    { type: 'Visita', description: 'Profesional 3 completó el servicio', date: '2025-04-10' }
  ];
}