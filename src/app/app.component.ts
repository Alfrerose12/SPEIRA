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
          console.log('[AuthState] Usuario cambió:', user);
          observer.next(user);
        });
      });

      this.authState$.subscribe((user) => {
        console.log('[AuthState suscripción] Usuario actual:', user);

        if (user) {
          // Aquí se asume que requestPermission() devuelve Promise<string | null>
          this.fcmService.requestPermission().then((token: string | null) => {
            console.log('[Permiso y Token Notificaciones] Resultado:', token);

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
              console.warn('[Token FCM] No se obtuvo token o permiso no concedido');
            }
          }).catch(err => {
            console.error('[Token FCM] Error obteniendo token:', err);
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
