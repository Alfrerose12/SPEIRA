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
  }

  requestPermission(): Promise<NotificationPermission> {
    return Notification.requestPermission();
  }

  async getTokenFCM(): Promise<string | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker no soportado en este navegador.');
      return null;
    }

    try {
      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registrado:', registration);

      // Esperar que el Service Worker esté listo
      const readyRegistration = await navigator.serviceWorker.ready;

      if (!readyRegistration.pushManager) {
        console.error('pushManager no está disponible en el Service Worker registrado.');
        return null;
      }

      // Obtener token con VAPID key y SW registrado
      const token = await getToken(this.messaging, {
        vapidKey: environment.messagingPublicKey,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('Token FCM obtenido:', token);
      } else {
        console.warn('No se obtuvo token FCM');
      }
      return token;
    } catch (error) {
      console.error('Error obteniendo token FCM', error);
      return null;
    }
  }

  listenMessages(callback: (payload: any) => void): void {
    onMessage(this.messaging, (payload) => {
      console.log('Mensaje recibido:', payload);
      callback(payload);
    });
  }
}
