import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioPageModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'reporte',
    loadChildren: () => import('./reporte/reporte.module').then(m => m.ReportePageModule)
  },
  {
    path: 'sensor-monitoring',
    loadChildren: () => import('./sensor-monitoring/sensor-monitoring.module').then(m => m.SensorMonitoringPageModule)
  },



];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
