import { Component } from '@angular/core';
import { Platform, IonicModule, ToastController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { FirebaseMessagingService } from './firebase-messaging.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
  providers: [FirebaseMessagingService, ApiService], // <- aquí los servicios
})
export class AppComponent {
  authState$!: Observable<any>;

  constructor(
    private platform: Platform,
    private auth: Auth,
    private fcmService: FirebaseMessagingService,
    private apiService: ApiService,
    private toastCtrl: ToastController
  ) {
    this.platform.ready().then(() => {
      document.body.classList.remove('dark');
      document.body.classList.add('light');

      this.authState$ = new Observable((observer) => {
        this.auth.onAuthStateChanged((user) => {
          observer.next(user);
        });
      });

      this.authState$.subscribe((user) => {
        if (user) {
          console.log('Usuario autenticado:', user);

          this.fcmService.requestPermission().then((permission: NotificationPermission) => {
            if (permission === 'granted') {
              this.fcmService.getTokenFCM().then((token: string | null) => {
                if (token) {
                  console.log('Token FCM:', token);

                  this.apiService.guardarTokenNotificacion(token).subscribe({
                    next: (res) => {
                      console.log('Token guardado en backend:', res);
                    },
                    error: (err) => {
                      console.error('Error guardando token en backend:', err);
                    }
                  });

                } else {
                  console.warn('No se obtuvo token FCM');
                }
              });
            } else {
              console.warn('Permiso para notificaciones no concedido');
            }
          });

          this.fcmService.listenMessages(async (payload: any) => {
            console.log('Notificación recibida en foreground:', payload);

            const toast = await this.toastCtrl.create({
              message: `${payload.notification?.title}: ${payload.notification?.body}`,
              duration: 5000,
              color: 'primary',
            });
            toast.present();
          });

        } else {
          console.log('No hay usuario autenticado');
        }
      });
    });
  }
}
