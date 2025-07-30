import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: false
})
export class AjustesPage implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  email: string = '';
  password: string = '';
  profileImage: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.email = userData.email || '';
    this.profileImage = 'assets/images/user-placeholder.png'; // Imagen por defecto
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string; // Solo para previsualización y envío
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    if (!this.email) {
      this.presentToast('El correo es obligatorio', 'warning');
      return;
    }

    const datosActualizar: any = {
      email: this.email,
      imagen: this.profileImage // Se envía al backend
    };

    if (this.password) {
      datosActualizar.password = this.password;
    }

    this.apiService.actualizarUsuario(datosActualizar).subscribe({
      next: () => {
        this.presentToast('Datos actualizados correctamente', 'success');
        this.password = '';
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        this.presentToast('Error al actualizar los datos', 'danger');
      }
    });
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        this.router.navigate(['/login']);
        this.location.replaceState('/login');
      },
      error: (err) => {
        console.error('Error en logout:', err);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  volverInicio() {
    this.router.navigate(['/inicio']);
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color
    });
    toast.present();
  }
}
