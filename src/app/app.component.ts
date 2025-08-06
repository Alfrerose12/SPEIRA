import { Component } from '@angular/core';
import { Platform, IonicModule, ToastController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { FirebaseMessagingService } from './services/firebase-messaging.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
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
          console.log('[AuthState] Usuario cambió:', user); // Log auth state change
          observer.next(user);
        });
      });

      this.authState$.subscribe((user) => {
        console.log('[AuthState suscripción] Usuario actual:', user); // Log current user

        if (user) {
          this.fcmService.requestPermission().then((permission: NotificationPermission) => {
            console.log('[Permiso Notificaciones] Resultado:', permission); // Log permission result

            if (permission === 'granted') {
              this.fcmService.getTokenFCM().then((token: string | null) => {
                console.log('[Token FCM] Token obtenido:', token); // Log token obtained

                if (token) {
                  this.apiService.guardarTokenNotificacion(token).subscribe({
                    next: (res) => {
                      console.log('[API] Token guardado:', res);
                    },
                    error: (err) => {
                      console.error('[API] Error guardando token:', err);
                    }
                  });
                } else {
                  console.warn('[Token FCM] No se obtuvo token');
                }
              }).catch(err => {
                console.error('[Token FCM] Error obteniendo token:', err);
              });
            } else {
              console.warn('[Permiso Notificaciones] Permiso NO concedido');
            }
          });
          
          this.fcmService.listenMessages(async (payload: any) => {
            console.log('[Foreground Message] Mensaje recibido:', payload);

            const toast = await this.toastCtrl.create({
              message: `${payload.notification?.title}: ${payload.notification?.body}`,
              duration: 5000,
              color: 'primary',
            });
            toast.present();
          });

        } else {
          console.log('[AuthState suscripción] No hay usuario autenticado');
        }
      });
    });
  }
}
