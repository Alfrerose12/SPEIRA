import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app/app-routing.module';
import { environment } from './environments/environment';

// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

// Nuevo import para HttpClient
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      IonicModule.forRoot(),
      AppRoutingModule
      // Ya NO importa HttpClientModule aquí
    ),
    provideHttpClient(withInterceptorsFromDi()), // <-- Agrega esta línea
    provideFirebaseApp(() => {
      console.log('Firebase inicializado correctamente');
      return initializeApp(environment.firebaseConfig);
    }),
    provideAuth(() => getAuth())
  ]
}).catch(err => console.error(err));
