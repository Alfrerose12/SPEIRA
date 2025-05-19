import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}

  register() {
    if (this.password !== this.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }
    console.log('Nombre:', this.name, 'Correo:', this.email, 'Contraseña:', this.password);
    // Aquí puedes agregar lógica adicional para el registro
    this.router.navigate(['/inicio']);
  }

  navigateToLogin() {
    this.router.navigate(['/tab1']); // Cambia '/login' por la ruta de tu página de inicio de sesión
  }
}