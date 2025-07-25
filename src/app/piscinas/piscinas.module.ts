import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PiscinasPageRoutingModule } from './piscinas-routing.module';

import { PiscinasPage } from './piscinas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PiscinasPageRoutingModule
  ],
  declarations: [PiscinasPage]
})
export class PiscinasPageModule {}
