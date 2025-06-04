import { Component } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage {
  nombre: string = '';
  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  async login() {
    if ((!this.email && !this.nombre) || !this.password) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, llena todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
  
    this.loading = true;
  
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...'
    });
    await loading.present();
  
    // Determinar si se usa 'email' o 'nombre' para iniciar sesión
    const loginData = this.email.includes('@')
      ? { email: this.email, password: this.password }
      : { nombre: this.email, password: this.password };
  
    console.log('Datos enviados al backend:', loginData); // Depuración: Verifica los datos enviados
  
    this.apiService.login(loginData).subscribe({
      next: async (response: any) => {
        console.log('Respuesta del servidor:', response); // Depuración: Verifica la respuesta del servidor
        await loading.dismiss();
        this.loading = false;
  
        if (response.success) {
          this.router.navigate(['/home']);
        } else {
          const alert = await this.alertController.create({
            header: 'Error',
            message: response.message || 'Credenciales incorrectas.',
            buttons: ['OK']
          });
          await alert.present();
        }
      },
      error: async (err: any) => {
        console.error('Error recibido del servidor:', err); // Depuración: Verifica el error recibido
        await loading.dismiss();
        this.loading = false;
  
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Error al conectar con el servidor.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}