import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { HttpClientModule } from '@angular/common/http';

// Importa HttpClientModule aquí
import { HttpClientModule } from '@angular/common/http';

// Opcional: si usas forms en toda la app
import { FormsModule } from '@angular/forms';

// Importa SweetAlert2 solo si lo usas globalmente
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [AppComponent],
<<<<<<< HEAD
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,   // <-- IMPORTANTE
    FormsModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
=======
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, SweetAlert2Module.forRoot(), HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent]
>>>>>>> cd8974c68d61c37a3dce887055d49d20dd749949
})
export class AppModule {}
