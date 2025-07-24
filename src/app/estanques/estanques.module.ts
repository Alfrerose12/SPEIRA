import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Importa HttpClientModule solo si no está en el módulo raíz
import { HttpClientModule } from '@angular/common/http';

import { EstanquesPage } from './estanques.page';

@NgModule({
  declarations: [EstanquesPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule, // opcional si ya lo tienes en AppModule
    RouterModule.forChild([
      {
        path: '',
        component: EstanquesPage
      }
    ])
  ]
})
export class EstanquesPageModule {}
