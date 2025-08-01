import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseMessagingService {
  private messaging = getMessaging(initializeApp(environment.firebaseConfig));

  requestPermission() {
    return Notification.requestPermission();
  }

  async getTokenFCM(): Promise<string | null> {
    try {
      const token = await getToken(this.messaging, { 
        vapidKey: 'BNctf7zQoi75ZkCccfJQyWF4ObxHVIVDHVg06W1SrV8_4e-wHcnguwLYXR0Qp3DnWyRVoxPpnrT9wINPm3UG7P0' 
      });
      return token;
    } catch (error) {
      console.error('Error obteniendo token FCM', error);
      return null;
    }
  }

  listenMessages(callback: (payload: any) => void) {
    onMessage(this.messaging, (payload) => {
      console.log('Mensaje recibido:', payload);
      callback(payload);
    });
  }
}
