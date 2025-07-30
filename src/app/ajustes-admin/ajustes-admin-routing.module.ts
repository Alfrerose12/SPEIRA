import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AjustesAdminPage } from './ajustes-admin.page';

const routes: Routes = [
  {
    path: '',
    component: AjustesAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AjustesAdminPageRoutingModule {}
