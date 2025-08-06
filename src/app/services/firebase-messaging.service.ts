import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseMessagingService {
  private app: FirebaseApp;
  private messaging: Messaging;

  constructor() {
    this.app = initializeApp(environment.firebaseConfig);
    this.messaging = getMessaging(this.app);
    console.log('[🔥] Firebase app initialized');
  }

  /**
   * Solicita permiso al usuario y obtiene el token FCM
   */
  async requestPermission(): Promise<string | null> {
    console.log('[🔥] Solicitando permiso para notificaciones...');
    
    const permission = await Notification.requestPermission();
    console.log('[🔥] Permiso de notificación:', permission);

    if (permission !== 'granted') {
      console.warn('[🔥] Permiso denegado por el usuario');
      return null;
    }

    return this.getTokenFCM();
  }

  /**
   * Obtiene el token FCM del dispositivo
   */
  private async getTokenFCM(): Promise<string | null> {
    if (!environment.serviceWorker) {
      console.warn('[🔥] Service Worker deshabilitado por configuración');
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[🔥] Service Worker no soportado en este navegador');
      return null;
    }

    try {
      console.log('[🔥] Registrando Service Worker...');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('[🔥] ✅ Service Worker registrado:', registration);

      const readyRegistration = await navigator.serviceWorker.ready;
      console.log('[🔥] Service Worker listo:', readyRegistration);

      if (!readyRegistration?.pushManager) {
        console.error('[🔥] ❌ pushManager no disponible en Service Worker');
        return null;
      }

      console.log('[🔥] pushManager disponible');

      const token = await getToken(this.messaging, {
        vapidKey: environment.messagingPublicKey,
        serviceWorkerRegistration: readyRegistration
      });

      if (token) {
        console.log('[🔥] 🎉 Token FCM obtenido:', token);
      } else {
        console.warn('[🔥] ⚠️ No se obtuvo token FCM');
      }

      return token;
    } catch (error) {
      console.error('[🔥] ❌ Error al obtener el token FCM:', error);
      return null;
    }
  }

  /**
   * Escucha mensajes cuando la app está en primer plano
   */
  listenMessages(callback: (payload: any) => void): void {
    onMessage(this.messaging, (payload) => {
      console.log('[🔥] 📩 Mensaje recibido en foreground:', payload);
      callback(payload);
    });
  }
}
