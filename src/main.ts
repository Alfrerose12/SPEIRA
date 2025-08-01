// Escucha errores globales y silencia el error específico de Cross-Origin-Opener-Policy sobre window.close
window.addEventListener('error', (event) => {
  if (event.message?.includes('Cross-Origin-Opener-Policy policy would block the window.close call')) {
    event.preventDefault(); // Evita que el error se muestre en consola
    console.warn('Error window.close silenciado por COOP');
  }
});

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app/app-routing.module';
import { environment } from './environments/environment';

// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

// HttpClient imports
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      IonicModule.forRoot(),
      AppRoutingModule
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideFirebaseApp(() => {
      console.log('Firebase inicializado correctamente');
      return initializeApp(environment.firebaseConfig);
    }),
    provideAuth(() => getAuth())
  ]
}).catch(err => console.error(err));

// 👉 Registro del Service Worker para FCM (muy importante)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => {
      console.log('Service Worker registrado correctamente:', reg);
    })
    .catch(err => {
      console.error('Error registrando el Service Worker:', err);
    });
}
