import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
    console.log('Correo:', this.email, 'Contraseña:', this.password);
    // Aquí puedes agregar lógica adicional para el inicio de sesión
  }

  navigateToRegister() {
    this.router.navigate(['/register']); // Redirige a la página de registro
  }
}