import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CustomAlertComponent } from '../components/custom-alert/custom-alert.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  showPassword = false;

  ngOnInit() {
  }

  constructor(private fb: FormBuilder, private router: Router, private modal: ModalController, private apiService: ApiService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      const isLoggedIn = await this.apiService.login(username, password);
      if (isLoggedIn) {
        await this.showCustomAlert('Inicio de sesión exitoso', 'success');
        this.router.navigate(['/home']);
      } else {
        await this.showCustomAlert('Credenciales inválidas', 'error');
      }
    } else {
      await this.showCustomAlert('Por favor completa todos los campos correctamente', 'error');
    }
  }

  async showCustomAlert(message: string, type: 'success' | 'error' = 'success') {
    const modal = await this.modal.create({
      component: CustomAlertComponent,
      componentProps: { message, type },
      cssClass: 'custom-alert-modal', 
      backdropDismiss: false
    });
    await modal.present();
  }



  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle() {
    // Aquí iría la lógica para iniciar sesión con Google
    console.log('Iniciar sesión con Google');
  }

  goToRegister() {
    // Redirecciona a la página de registro
    this.router.navigate(['/register']);
  }

}
