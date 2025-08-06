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
    console.log('Firebase app initialized');
  }

  /**
   * Solicita permiso al usuario para enviar notificaciones
   */
  requestPermission(): Promise<NotificationPermission> {
    console.log('Solicitando permiso para notificaciones...');
    return Notification.requestPermission();
  }

  /**
   * Obtiene el token FCM del dispositivo
   */
  async getTokenFCM(): Promise<string | null> {
    if (!environment.serviceWorker) {
      console.warn('Service Worker deshabilitado por configuración.');
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker no soportado en este navegador.');
      return null;
    }

    try {
      console.log('Registrando Service Worker...');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registrado:', registration);

      console.log('Esperando a que el Service Worker esté listo...');
      const readyRegistration = await navigator.serviceWorker.ready;
      console.log('Service Worker listo:', readyRegistration);

      if (!readyRegistration.pushManager) {
        console.error('❌ pushManager no está disponible en el Service Worker registrado.');
        return null;
      }
      console.log('pushManager disponible.');

      console.log('Solicitando token FCM...');
      const token = await getToken(this.messaging, {
        vapidKey: environment.messagingPublicKey,
        serviceWorkerRegistration: readyRegistration
      });

      if (token) {
        console.log('🎉 Token FCM obtenido:', token);
      } else {
        console.warn('⚠️ No se obtuvo token FCM');
      }

      return token;
    } catch (error) {
      console.error('❌ Error al obtener el token FCM:', error);
      return null;
    }
  }

  /**
   * Escucha mensajes cuando la app está en primer plano
   */
  listenMessages(callback: (payload: any) => void): void {
    onMessage(this.messaging, (payload) => {
      console.log('📩 Mensaje recibido en foreground:', payload);
      callback(payload);
    });
  }
}
