import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CajasPageRoutingModule } from './cajas-routing.module';

import { CajasPage } from './cajas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CajasPageRoutingModule
  ],
  declarations: [CajasPage]
})
export class CajasPageModule {}
