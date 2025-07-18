import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})

export class RegisterPage implements OnInit {

  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async register() {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      const alert = await this.alertController.create({
        header: 'Campos vacíos',
        message: 'Por favor, completa todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.password !== this.confirmPassword) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando usuario...'
    });
    await loading.present();
    this.loading = true;

    const registerData = {
      nombre: this.fullName,
      email: this.email,
      password: this.password,
      rol: 'usuario'  
    };

    this.apiService.register(registerData).subscribe({
      next: async (response: any) => {
        await loading.dismiss();
        this.loading = false;

        if (response.success) {
          const alert = await this.alertController.create({
            header: 'Registro exitoso',
            message: 'Tu cuenta ha sido creada correctamente.',
            buttons: ['OK']
          });
          await alert.present();
          this.router.navigate(['/inicio']);
        } else {
          const alert = await this.alertController.create({
            header: 'Error',
            message: response.message || 'No se pudo completar el registro.',
            buttons: ['OK']
          });
          await alert.present();
        }
      },
      error: async (err: any) => {
        await loading.dismiss();
        this.loading = false;

        const alert = await this.alertController.create({
          header: 'Error',
          message: err.error?.message || 'No se pudo conectar con el servidor.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
}
