import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { SensorMonitoringPage } from './sensor-monitoring.page';

@NgModule({
  declarations: [SensorMonitoringPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: '',
        component: SensorMonitoringPage
      }
    ])
  ]
})
export class SensorMonitoringPageModule {}