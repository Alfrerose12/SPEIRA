import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SensorMonitoringPage } from './sensor-monitoring.page';

const routes: Routes = [
  {
    path: '',
    component: SensorMonitoringPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SensorMonitoringPageRoutingModule {}
