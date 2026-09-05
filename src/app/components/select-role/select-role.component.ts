import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-role.component.html',
  styleUrls: ['./select-role.component.css']
})
export class SelectRoleComponent {
  constructor(private router: Router) {}

  // Llamar al darle click en la imagen de un rol:
  goToRegister(role: string) {
    // Navega a /register y le pasa el role por query param
    this.router.navigate(['/register'], { queryParams: { role } });
  }
}
