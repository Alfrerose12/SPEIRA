import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private messaging: Messaging | null = null;

  constructor() {
    this.initFirebaseMessaging();
  }

  private async initFirebaseMessaging() {
    const supported = await isSupported();
    if (supported) {
      const app = initializeApp(environment.firebaseConfig);
      this.messaging = getMessaging(app);
      console.log('✅ Firebase Messaging inicializado');
    } else {
      console.warn('⚠️ Firebase Messaging no es soportado en este navegador o entorno.');
      this.messaging = null;
    }
  }

  async requestPermissionAndGetToken(): Promise<string | null> {
    if (!this.messaging) {
      console.warn('🚫 Firebase Messaging no está disponible.');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Permiso de notificaciones no concedido');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: environment.messagingPublicKey
      });

      if (token) {
        console.log('🔥 Token FCM obtenido:', token);
        return token;
      } else {
        console.warn('No se pudo obtener el token FCM');
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo token FCM:', error);
      return null;
    }
  }

  listenToForegroundMessages() {
    if (!this.messaging) {
      return;
    }

    onMessage(this.messaging, (payload) => {
      console.log('📩 Mensaje recibido en primer plano:', payload);
      // Puedes mostrar alerta, actualizar UI, etc.
      alert(`🔔 ${payload.notification?.title}\n${payload.notification?.body}`);
    });
  }
}
