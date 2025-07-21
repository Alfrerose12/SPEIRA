import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { signInWithPopup } from 'firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})

export class LoginPage implements OnInit {

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
  ) { }

  ngOnInit() {
  }

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

    try {
      const loginData = this.email.includes('@')
        ? { email: this.email, password: this.password }
        : { nombre: this.nombre || this.email, password: this.password };

      this.apiService.login(loginData).subscribe({
        next: async (response: any) => {
          await loading.dismiss();

          localStorage.setItem('authToken', response.token || '');
          localStorage.setItem('userData', JSON.stringify(response.user || {}));
          localStorage.setItem('userRole', response.user?.rol || 'user');

          this.router.navigate(['/inicio'], {
            state: { userData: response.user }
          });
        },
        error: async (error) => {
          await loading.dismiss();
          console.error('Error en login:', error);
          this.showErrorAlert(error.error?.message || 'Credenciales incorrectas');
        }
      });
    } catch (error) {
      await loading.dismiss();
      console.error('Error inesperado:', error);
      this.showErrorAlert('Error inesperado al iniciar sesión');
    }
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      console.log('Usuario autenticado con Google:', result.user);
      this.router.navigate(['/inicio']);
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
