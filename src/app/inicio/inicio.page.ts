import { Component } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

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
  showPassword: boolean = false;

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router,
    private auth: Auth
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if ((!this.email && !this.nombre) || !this.password) {
      const alert = await this.alertController.create({
        header: 'Campos vacíos',
        message: 'Por favor, llena todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...'
    });
    await loading.present();
    this.loading = true;

    const loginData = this.email.includes('@')
      ? { email: this.email, password: this.password }
      : { nombre: this.email, password: this.password };

    console.log('Datos enviados al backend:', loginData);

    this.apiService.login(loginData).subscribe({
      next: async (response: any) => {
        console.log('Respuesta completa del servidor:', response); // Depura la respuesta completa
        console.log('Rol recibido del servidor:', response.user?.rol); // Verifica el rol recibido
        await loading.dismiss();
        this.loading = false;

        if (response.success) {
          const rol = response.rol || 'usuario'; // Accede directamente a response.rol si no está en response.user
          console.log(`Usuario con rol: ${rol}`);
          this.router.navigate(['/home'], { queryParams: { rol } }); // Pasar el rol como parámetro
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
        console.error('Error recibido del servidor:', err);
        await loading.dismiss();
        this.loading = false;

        const alert = await this.alertController.create({
          header: err.status === 401 ? 'Acceso denegado' : 'Error',
          message: err.status === 401
            ? 'Correo, nombre o contraseña incorrectos.'
            : 'No se pudo conectar con el servidor.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      console.log('Usuario autenticado con Google:', result.user);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo iniciar sesión con Google.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}