// src/app/services/fcm.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  messaging: any;

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyCe1-ukYoXmUPeSQqqmmSL_bUnFsY_3hs0",
      authDomain: "speira-c84d5.firebaseapp.com",
      projectId: "speira-c84d5",
      storageBucket: "speira-c84d5.appspot.com",
      messagingSenderId: "405388809495",
      appId: "1:405388809495:web:d2d8cde904c3f4e3ec5352",
      measurementId: "G-DWJCN7HR3Y"
    };

    const app = initializeApp(firebaseConfig);
    this.messaging = getMessaging(app);
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: 'TU_VAPID_KEY (opcional si solo móvil)'
      });
      console.log('🔥 Token FCM:', token);
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  }

  listenToForegroundMessages() {
    onMessage(this.messaging, payload => {
      console.log('📩 Mensaje en foreground:', payload);
      alert(`🔔 ${payload.notification?.title}\n${payload.notification?.body}`);
    });
  }
}
