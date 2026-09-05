import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent {
  scannedResult: string = '';

  // Este método es solo un ejemplo para simular el escaneo
  simulateScan(result: string): void {
    this.scannedResult = result;
  }
}