import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private apiService: ApiService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  async register() {
    // Validar que todos los campos estén llenos
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Todos los campos son obligatorios.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.password !== this.confirmPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Llamar al servicio para registrar al usuario
    this.apiService.register({ 
      nombre: this.name, 
      email: this.email, 
      password: this.password, 
    }).subscribe({
      next: async (res: any) => {
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: 'Usuario registrado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/inicio']);
      },
      error: async (err: any) => {
        const errorMessage = err.error?.error || 'Error al registrar. Intenta de nuevo.';
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: errorMessage,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/inicio']); // Redirigir al inicio de sesión
  }
}