import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstanquesPage } from './estanques.page';

const routes: Routes = [
  {
    path: '',
    component: EstanquesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstanquesPageRoutingModule {}
