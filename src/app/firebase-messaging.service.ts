import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { environment } from '../environments/environment';

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
    try {
      const token = await getToken(this.messaging, {
        vapidKey: 'BNctf7zQoi75ZkCccfJQyWF4ObxHVIVDHVg06W1SrV8_4e-wHcnguwLYXR0Qp3DnWyRVoxPpnrT9wINPm3UG7P0'
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
