import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../components/popover-menu/popover-menu.component';

declare var navigator: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {

  isAdmin: boolean = false;
  estanqueSeleccionado: string = '';
  userName: string = '';

  constructor(
    private router: Router,
    private popover: PopoverController,
    private platform: Platform,
    private location: Location
  ) { }

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.isAdmin = localStorage.getItem('userRole') === 'admin';
    this.userName = userData.nombre || userData.email || 'Usuario';

    this.configureBackButton();
  }

  configureBackButton() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.exitApp();
    });

    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };
    history.pushState(null, '', location.href);
  }

  exitApp() {
    if (navigator?.app?.exitApp) {
      navigator.app.exitApp();
    } else {
      window.close();
    }
  }

  onSelectEstanque(nombreEstanque: string) {
    this.estanqueSeleccionado = nombreEstanque;
    console.log(`Estanque seleccionado: ${this.estanqueSeleccionado}`);
  }

  async onImageClick(nombre: string, event: Event) {
    const popover = await this.popover.create({
      component: PopoverMenuComponent,
      componentProps: { tipo: nombre, isAdmin: this.isAdmin },
      event,
      translucent: true,
      showBackdrop: false,
      side: 'top'
    });
    await popover.present();
  }

  navigateToReporte() {
    if (!this.isAdmin && !this.estanqueSeleccionado) {
      alert('Selecciona un estanque primero');
      return;
    }
    this.router.navigate(['/reporte'], {
      queryParams: { estanque: this.estanqueSeleccionado }
    });
  }

  goToUsuario() {
    this.router.navigate(['/ajustes']);
  }

  goToReportes() {
    if (this.isAdmin){
      this.router.navigate(['/reporte']);
    } else {
      this.navigateToReporte();
    }
  }

  goToMonitoreo() {
    this.router.navigate(['/sensor-monitoring']);
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');

    this.router.navigate(['/login']);
    this.location.replaceState('/login');
  }

}
