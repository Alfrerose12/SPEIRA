import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CajasPage } from './cajas.page';

const routes: Routes = [
  {
    path: '',
    component: CajasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CajasPageRoutingModule {}
