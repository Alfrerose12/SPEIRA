import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AjustesAdminPageRoutingModule } from './ajustes-admin-routing.module';

import { AjustesAdminPage } from './ajustes-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AjustesAdminPageRoutingModule
  ],
  declarations: [AjustesAdminPage]
})
export class AjustesAdminPageModule {}
